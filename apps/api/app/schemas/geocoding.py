from datetime import datetime, timezone

from pydantic import BaseModel, Field, field_validator


class GeocodeCandidateRead(BaseModel):
    formatted_address: str
    latitude: float
    longitude: float
    place_id: str | None = None


class GeocodeResponse(BaseModel):
    query: str
    provider: str
    source_uri: str
    resolved_at: datetime
    valid_until: datetime
    age_seconds: int = Field(ge=0)
    results: list[GeocodeCandidateRead] = Field(default_factory=list)

    @field_validator("resolved_at", "valid_until", mode="before")
    @classmethod
    def require_aware_times(cls, value):
        if isinstance(value, datetime) and (value.tzinfo is None or value.utcoffset() is None):
            return value.replace(tzinfo=timezone.utc)
        return value
