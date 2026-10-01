from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: list[Any] = Field(default_factory=list)
    request_id: str


class ErrorEnvelope(BaseModel):
    error: ErrorDetail


class SlotRead(ORMModel):
    id: str
    start_at: datetime
    end_at: datetime
    capacity_total: int | None
    available_reported: int | None
    status: str
    version: int
    data_mode: str = "simulated"

    @field_validator("start_at", "end_at", "confirmed_at", "expires_at", mode="before", check_fields=False)
    @classmethod
    def require_aware_output(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value


class POIRead(ORMModel):
    id: str
    name: str
    description: str
    latitude: float
    longitude: float
    category: str
    address: str
    verification_status: str
    data_mode: str = "simulated"


class ExperienceRead(ORMModel):
    id: str
    name: str
    description: str
    poi_id: str
    provider_id: str
    intent_tags: list[str]
    is_hands_on: bool
    is_indoor: bool
    primary_intent: str | None = None
    weather_sensitivity: str | None = None
    tagger_prompt_version: str | None = None
    duration_min: int
    indoor: bool
    price_basis: str
    price_vnd: int
    verification_status: str
    poi: POIRead
    slots: list[SlotRead] = Field(default_factory=list)
    data_mode: str = "simulated"
