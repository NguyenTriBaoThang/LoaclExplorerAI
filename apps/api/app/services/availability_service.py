from app.core.enums import SlotStatus
from app.models.entities import ExperienceSlot


class AvailabilityService:
    """Applies reported slot/capacity semantics without treating unknown as sold out."""

    def can_fit(self, slot: ExperienceSlot, group_size: int) -> bool:
        if slot.status in {SlotStatus.FULL.value, SlotStatus.UNAVAILABLE.value, SlotStatus.CANCELLED.value}:
            return False
        if slot.available_reported == 0:
            return False
        if slot.available_reported is not None and slot.available_reported < group_size:
            return False
        return True

    @staticmethod
    def is_capacity_known(slot: ExperienceSlot) -> bool:
        return slot.available_reported is not None
