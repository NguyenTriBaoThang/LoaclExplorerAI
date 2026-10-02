from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from app.core.enums import SlotStatus
from app.repositories.experience_repository import ExperienceRepository
from app.schemas.common import ExperienceRead, SlotRead


class ExperienceService:
    def __init__(self, repository: ExperienceRepository):
        self.repository = repository

    def list(
        self,
        intent: str | None = None,
        start_at: datetime | None = None,
        end_at: datetime | None = None,
        group_size: int | None = None,
        max_price: int | None = None,
        topic: str | None = None,
        is_indoor: bool | None = None,
        query: str | None = None,
        max_distance_km: float | None = None,
        center_latitude: float | None = None,
        center_longitude: float | None = None,
        slot_id: str | None = None,
    ):
        items = self.repository.list_experiences(intent=intent, max_price=max_price)
        result: list[ExperienceRead] = []
        for item in items:
            if topic and topic.casefold() not in " ".join(item.intent_tags or []).casefold() and topic.casefold() not in item.poi.category.casefold():
                continue
            if is_indoor is not None and item.is_indoor != is_indoor:
                continue
            if query:
                searchable = " ".join((item.name, item.title, item.description, item.poi.name, item.poi.district or "", item.poi.address, *(item.intent_tags or []))).casefold()
                if query.casefold() not in searchable:
                    continue
            if max_distance_km is not None:
                if center_latitude is None or center_longitude is None:
                    continue
                dlat = radians(item.poi.latitude - center_latitude)
                dlon = radians(item.poi.longitude - center_longitude)
                lat1, lat2 = radians(center_latitude), radians(item.poi.latitude)
                a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
                distance_km = 6371.0 * 2 * asin(sqrt(min(1.0, a)))
                if distance_km > max_distance_km:
                    continue
            slots = [slot for slot in item.slots if slot.status not in {
                SlotStatus.FULL.value, SlotStatus.UNAVAILABLE.value, SlotStatus.CANCELLED.value,
            } and slot.available_reported != 0]
            if start_at:
                slots = [slot for slot in slots if slot.start_at.replace(tzinfo=slot.start_at.tzinfo or start_at.tzinfo) >= start_at]
            if end_at:
                slots = [slot for slot in slots if slot.end_at.replace(tzinfo=slot.end_at.tzinfo or end_at.tzinfo) <= end_at]
            if group_size:
                slots = [slot for slot in slots if slot.available_reported is None or slot.available_reported >= group_size]
            if slot_id:
                slots = [slot for slot in slots if slot.id == slot_id]
            if (start_at or end_at) and not slots:
                continue
            experience = ExperienceRead.model_validate(item)
            result.append(experience.model_copy(update={"slots": [SlotRead.model_validate(slot) for slot in slots]}))
        return result
