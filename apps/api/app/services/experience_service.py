from datetime import datetime

from app.repositories.experience_repository import ExperienceRepository
from app.schemas.common import ExperienceRead, SlotRead


class ExperienceService:
    def __init__(self, repository: ExperienceRepository):
        self.repository = repository

    def list(self, intent: str | None = None, start_at: datetime | None = None, end_at: datetime | None = None, group_size: int | None = None, max_price: int | None = None):
        items = self.repository.list_experiences(intent=intent, max_price=max_price)
        result: list[ExperienceRead] = []
        for item in items:
            slots = item.slots
            if start_at:
                slots = [slot for slot in slots if slot.start_at.replace(tzinfo=slot.start_at.tzinfo or start_at.tzinfo) >= start_at]
            if end_at:
                slots = [slot for slot in slots if slot.end_at.replace(tzinfo=slot.end_at.tzinfo or end_at.tzinfo) <= end_at]
            if group_size:
                slots = [slot for slot in slots if slot.available_reported is None or slot.available_reported >= group_size]
            if (start_at or end_at) and not slots:
                continue
            experience = ExperienceRead.model_validate(item)
            result.append(experience.model_copy(update={"slots": [SlotRead.model_validate(slot) for slot in slots]}))
        return result
