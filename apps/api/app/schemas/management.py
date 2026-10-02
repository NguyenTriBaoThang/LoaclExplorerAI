from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ExperienceDraftRequest(BaseModel):
    poi_id: str = Field(min_length=1, max_length=36)
    title: str = Field(min_length=2, max_length=180)
    description: str = Field(min_length=1, max_length=10000)
    intent_tags: list[str] = Field(default_factory=list, max_length=30)
    is_hands_on: bool = False
    is_indoor: bool = True
    duration_min: int = Field(ge=10, le=1440)
    price_vnd: int = Field(ge=0)
    price_basis: Literal["per_person", "per_group"] = "per_person"


class SlotCreateRequest(BaseModel):
    start_at: datetime
    end_at: datetime
    capacity_total: int = Field(ge=1, le=10000)
    available_reported: int = Field(ge=0, le=10000)

    @field_validator("start_at", "end_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Datetime must include a timezone offset")
        return value


class SlotUpdateRequest(BaseModel):
    expected_version: int = Field(ge=1)
    status: Literal["open", "full", "cancelled"]
    available_reported: int | None = Field(default=None, ge=0, le=10000)
    capacity_total: int | None = Field(default=None, ge=1, le=10000)


class ModerationRequest(BaseModel):
    action: Literal["approve", "reject", "hide"]
    note: str = Field(default="", max_length=1000)


class ProviderCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=180)
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=12, max_length=128)
    contact_phone: str | None = Field(default=None, max_length=40)
    address: str = Field(default="", max_length=300)


class AdminUserUpdateRequest(BaseModel):
    role: Literal["traveler", "provider", "admin"]
    is_active: bool
    provider_id: str | None = None


class POIMergeRequest(BaseModel):
    keep_id: str = Field(min_length=1, max_length=36)
    duplicate_id: str = Field(min_length=1, max_length=36)
    reason: str = Field(min_length=3, max_length=1000)
