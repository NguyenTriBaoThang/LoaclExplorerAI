from typing import Literal

from pydantic import BaseModel, Field


class BookingHoldRequest(BaseModel):
    itinerary_id: str = Field(min_length=1, max_length=36)
    itinerary_stop_id: str = Field(min_length=1, max_length=36)
    quantity: int = Field(default=1, ge=1, le=10000)


class BookingDecisionRequest(BaseModel):
    action: Literal["accept", "reject"]
    note: str = Field(default="", max_length=1000)


class BookingCancellationDecisionRequest(BaseModel):
    action: Literal["approve", "reject"]
    note: str = Field(default="", max_length=1000)


class BookingCancelRequest(BaseModel):
    reason: str = Field(default="", max_length=1000)
