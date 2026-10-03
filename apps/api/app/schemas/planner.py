from datetime import datetime, timezone
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas.common import POIRead, SourceEvidenceRead


class PlanRequest(BaseModel):
    start_at: datetime
    end_at: datetime
    group_size: int = Field(ge=1, le=50)
    budget_vnd: int = Field(ge=0)
    transport_mode: Literal["walking", "bicycling", "driving", "motorcycle", "car", "transit"] = "driving"
    intent_weights: dict[str, float] = Field(default_factory=dict)
    locked_experience_ids: list[str] = Field(default_factory=list)
    locked_poi_ids: list[str] = Field(default_factory=list)
    origin_latitude: float | None = Field(default=None, ge=-90, le=90)
    origin_longitude: float | None = Field(default=None, ge=-180, le=180)
    destination_latitude: float | None = Field(default=None, ge=-90, le=90)
    destination_longitude: float | None = Field(default=None, ge=-180, le=180)
    origin_label: str | None = Field(default=None, max_length=200)
    destination_label: str | None = Field(default=None, max_length=200)

    @model_validator(mode="after")
    def require_coordinate_pairs(self):
        if (self.origin_latitude is None) != (self.origin_longitude is None):
            raise ValueError("Provide both origin latitude and longitude")
        if (self.destination_latitude is None) != (self.destination_longitude is None):
            raise ValueError("Provide both destination latitude and longitude")
        return self

    @field_validator("start_at", "end_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Datetime must include a timezone offset")
        return value


class RouteLeg(BaseModel):
    from_experience_id: str | None
    to_experience_id: str | None
    from_label: str | None = None
    to_label: str | None = None
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
    data_status: Literal["verified", "stale", "simulated", "unverified"] = "simulated"
    slot_confirmed_at: datetime | None = None
    slot_expires_at: datetime | None = None
    source_evidence: list[SourceEvidenceRead] = Field(default_factory=list)
    slot_source_evidence: list[SourceEvidenceRead] = Field(default_factory=list)
    poi: POIRead

    @field_validator("arrival_at", "start_at", "end_at", "slot_confirmed_at", "slot_expires_at", mode="before")
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
    ranking_model_version: str | None = None


class PlanResponse(BaseModel):
    request_id: str
    itinerary_id: str
    data_mode: str = "simulated"
    data_as_of: datetime
    feasibility_status: str
    estimated_cost_vnd: int
    total_travel_min: int
    start_at: datetime | None = None
    return_deadline: datetime | None = None
    estimated_return_at: datetime | None = None
    stops: list[ItineraryStopRead]
    routes: list[RouteLeg]
    explanation: Explanation

    @field_validator("data_as_of", mode="before")
    @classmethod
    def require_aware_as_of(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value

    @field_validator("start_at", "return_deadline", "estimated_return_at", mode="before")
    @classmethod
    def require_aware_trip_times(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value
