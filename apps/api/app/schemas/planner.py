from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import POIRead


class PlanRequest(BaseModel):
    start_at: datetime
    end_at: datetime
    group_size: int = Field(ge=1, le=50)
    budget_vnd: int = Field(ge=0)
    transport_mode: Literal["walking", "bicycling", "driving", "transit"] = "driving"
    intent_weights: dict[str, float] = Field(default_factory=dict)
    locked_experience_ids: list[str] = Field(default_factory=list)

    @field_validator("start_at", "end_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Datetime must include a timezone offset")
        return value


class RouteLeg(BaseModel):
    from_experience_id: str | None
    to_experience_id: str
    distance_m: int
    duration_min: int
    provider: str = "mock"
    is_realtime: bool = False


class ItineraryStopRead(BaseModel):
    id: str
    experience_id: str
    slot_id: str
    position: int
    name: str
    category: str
    arrival_at: datetime
    start_at: datetime
    end_at: datetime
    duration_min: int
    cost_vnd: int
    locked: bool
    availability_status: str
    availability_known: bool
    poi: POIRead

    @field_validator("arrival_at", "start_at", "end_at", mode="before")
    @classmethod
    def require_aware_output(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value


class Explanation(BaseModel):
    preserved_intents: list[str] = Field(default_factory=list)
    lost_intents: list[str] = Field(default_factory=list)
    reason_codes: list[str] = Field(default_factory=list)
    evidence_refs: list[str] = Field(default_factory=list)
    uncertainty: list[str] = Field(default_factory=list)


class PlanResponse(BaseModel):
    request_id: str
    itinerary_id: str
    data_mode: str = "simulated"
    data_as_of: datetime
    feasibility_status: str
    estimated_cost_vnd: int
    total_travel_min: int
    stops: list[ItineraryStopRead]
    routes: list[RouteLeg]
    explanation: Explanation

    @field_validator("data_as_of", mode="before")
    @classmethod
    def require_aware_as_of(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value
