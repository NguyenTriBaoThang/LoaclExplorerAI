from pathlib import Path

from app.core.config import settings


class E5NotConfigured(Exception):
    pass


class E5ProviderError(Exception):
    pass


class E5SearchService:
    """Local-only multilingual E5 ranking; model loading cannot use the network."""

    _model = None
    _model_path: str | None = None

    def _load_model(self):
        path = settings.e5_model_path
        if not path or not Path(path).is_dir():
            raise E5NotConfigured("Set E5_MODEL_PATH to a locally installed intfloat/multilingual-e5-base model directory.")
        if self.__class__._model is None or self.__class__._model_path != path:
            try:
                from sentence_transformers import SentenceTransformer

                self.__class__._model = SentenceTransformer(path, device="cpu", local_files_only=True)
                self.__class__._model_path = path
            except (ImportError, OSError, ValueError) as error:
                raise E5NotConfigured("Install the optional E5 dependencies and place the model files locally.") from error
        return self.__class__._model

    def embed_and_rank(self, query: str, passages: list[str]) -> list[float]:
        model = self._load_model()
        try:
            import numpy as np

            vectors = model.encode(
                [f"query: {query}", *(f"passage: {passage}" for passage in passages)],
                normalize_embeddings=True,
                show_progress_bar=False,
                convert_to_numpy=True,
            )
            matrix = np.asarray(vectors, dtype=np.float32)
            if matrix.ndim != 2 or matrix.shape[0] != len(passages) + 1:
                raise ValueError("Unexpected embedding dimensions")
            return (matrix[1:] @ matrix[0]).tolist()
        except (ValueError, TypeError) as error:
            raise E5ProviderError("Local E5 inference failed.") from error
