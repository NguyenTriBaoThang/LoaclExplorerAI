from datetime import datetime
from typing import Any, Protocol, Sequence

from datetime import timezone


def as_aware(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


class PlannerEngine(Protocol):
    """Replaceable decision engine; candidates have already passed hard constraints."""

    def plan(self, candidates: Sequence[dict[str, Any]]) -> dict[str, Any] | None: ...


class HeuristicPlanner:
    """At each step, schedule the earliest feasible slot and rank ties by intent fit."""

    def plan(self, candidates: Sequence[dict[str, Any]]) -> dict[str, Any] | None:
        if not candidates:
            return None
        locked = [item for item in candidates if item["locked"]]
        if locked:
            return min(locked, key=lambda item: as_aware(item["slot"].start_at))
        earliest: datetime = min(as_aware(item["slot"].start_at) for item in candidates)
        same_time = [item for item in candidates if as_aware(item["slot"].start_at) == earliest]
        return max(same_time, key=lambda item: (item["score"], -item["cost"]))
