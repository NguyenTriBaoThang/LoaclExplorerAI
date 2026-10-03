"""Optional local XGBoost ranker; absence never fabricates ML predictions."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from app.core.config import settings
from app.services.ranker_features import FEATURE_NAMES, build_feature_row, is_hard_feasible


class MLRankerUnavailable(RuntimeError):
    pass


class MLRankerService:
    def __init__(self, artifact_dir: str | None = None):
        configured = artifact_dir if artifact_dir is not None else settings.ranker_model_dir
        self.artifact_dir = Path(configured).expanduser() if configured else None
        self._model = None
        self._metadata: dict[str, Any] = {}
        self._error: str | None = None

    @property
    def configured(self) -> bool:
        return bool(self.artifact_dir and all(
            (self.artifact_dir / filename).is_file()
            for filename in ("local_explorer_ranker.json", "model_metadata.json", "feature_schema.json")
        ))

    def status(self) -> dict[str, Any]:
        metadata: dict[str, Any] = {}
        path = self.artifact_dir / "model_metadata.json" if self.artifact_dir else None
        if path and path.is_file():
            try:
                metadata = json.loads(path.read_text(encoding="utf-8"))
            except (OSError, json.JSONDecodeError):
                pass
        dataset_status = metadata.get("dataset_status", "unknown")
        blocked_for_provenance = (
            dataset_status != "verified_human_labeled"
            and settings.app_env.lower() not in {"development", "test"}
            and not settings.allow_unverified_ranker
        )
        return {
            "configured": self.configured,
            "loaded": self._model is not None,
            "model_version": metadata.get("model_version"),
            "dataset_status": dataset_status,
            "deployment_allowed": self.configured and not blocked_for_provenance,
            "block_reason": (
                "Ranker artifact files are missing or incomplete." if not self.configured
                else "Unverified ranking labels are disabled in production." if blocked_for_provenance
                else None
            ),
            "error": self._error,
        }

    def _load(self):
        if self._model is not None:
            return self._model
        if not self.configured or self.artifact_dir is None:
            raise MLRankerUnavailable("Ranker artifact is not configured. Put the trained bundle in RANKER_MODEL_DIR.")
        try:
            import xgboost as xgb

            self._metadata = json.loads((self.artifact_dir / "model_metadata.json").read_text(encoding="utf-8"))
            if self._metadata.get("feature_names") != FEATURE_NAMES:
                raise ValueError("Ranker feature schema does not match this API version.")
            dataset_status = self._metadata.get("dataset_status", "unknown")
            if (dataset_status != "verified_human_labeled"
                    and settings.app_env.lower() not in {"development", "test"}
                    and not settings.allow_unverified_ranker):
                raise ValueError("Production requires dataset_status=verified_human_labeled or ALLOW_UNVERIFIED_RANKER=true.")
            model = xgb.XGBRanker()
            model.load_model(str(self.artifact_dir / "local_explorer_ranker.json"))
            self._model = model
            return model
        except Exception as error:
            self._error = f"{type(error).__name__}: {error}"
            raise MLRankerUnavailable("Unable to load the local ranker artifact.") from error

    def rank(self, query: dict[str, Any], candidates: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str], dict[str, Any]]:
        model = self._load()
        feasible: list[dict[str, Any]] = []
        rejected_ids: list[str] = []
        for candidate in candidates:
            if is_hard_feasible(query, candidate):
                feasible.append(candidate)
            else:
                rejected_ids.append(str(candidate.get("candidate_experience_id", "")))
        if not feasible:
            return [], rejected_ids, self.status()

        import pandas as pd

        matrix = pd.DataFrame(
            [build_feature_row(query, candidate) for candidate in feasible],
            columns=FEATURE_NAMES,
        )
        try:
            scores = model.predict(matrix)
        except Exception as error:
            self._error = f"{type(error).__name__}: {error}"
            raise MLRankerUnavailable("The local ranker could not score this feature batch.") from error
        ranked = [{**candidate, "rank_score": float(score)} for candidate, score in zip(feasible, scores, strict=True)]
        ranked.sort(key=lambda item: item["rank_score"], reverse=True)
        return ranked, rejected_ids, self.status()


ranker_service = MLRankerService()
