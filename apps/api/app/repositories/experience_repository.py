from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.entities import Experience, ExperienceSlot, POI
from app.services.evidence_service import current_verified_evidence, entity_is_operationally_verified, evidence_summary, slot_is_operationally_verified


class ExperienceRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_experiences(self, intent: str | None = None, max_price: int | None = None) -> list[Experience]:
        query = select(Experience).join(POI).options(joinedload(Experience.poi), selectinload(Experience.slots))
        query = query.where(Experience.verification_status.in_(["verified", "simulated"]), POI.verification_status.in_(["verified", "simulated"]))
        if max_price is not None:
            query = query.where(Experience.price_vnd <= max_price)
        items = list(self.db.scalars(query.order_by(Experience.name)).unique())
        items = [item for item in items if self._is_public(item)]
        if intent:
            items = [item for item in items if intent in (item.intent_tags or [])]
        return items

    def get_experience(self, experience_id: str) -> Experience | None:
        item = self.db.scalar(
            select(Experience)
            .join(POI)
            .where(Experience.id == experience_id, Experience.verification_status.in_(["verified", "simulated"]), POI.verification_status.in_(["verified", "simulated"]))
            .options(joinedload(Experience.poi), selectinload(Experience.slots))
        )
        return item if item and self._is_public(item) else None

    def list_pois(self) -> list[POI]:
        items = list(self.db.scalars(select(POI).where(POI.verification_status.in_(["verified", "simulated"])).order_by(POI.name)))
        return [item for item in items if item.verification_status == "simulated" or entity_is_operationally_verified(self.db, "poi", item)]

    def get_poi(self, poi_id: str) -> POI | None:
        item = self.db.scalar(select(POI).where(POI.id == poi_id, POI.verification_status.in_(["verified", "simulated"])))
        if item is None or (item.verification_status != "simulated" and not entity_is_operationally_verified(self.db, "poi", item)):
            return None
        return item

    def list_slots(self, experience_id: str, start_at: datetime | None = None, end_at: datetime | None = None) -> list[ExperienceSlot]:
        query = select(ExperienceSlot).where(ExperienceSlot.experience_id == experience_id).order_by(ExperienceSlot.start_at)
        if start_at:
            query = query.where(ExperienceSlot.start_at >= start_at)
        if end_at:
            query = query.where(ExperienceSlot.end_at <= end_at)
        items = list(self.db.scalars(query))
        experience = self.db.get(Experience, experience_id)
        if experience and experience.verification_status == "verified":
            items = [slot for slot in items if self.is_fresh_slot(slot)]
        return items

    def source_evidence(self, target_type: str, target_id: str, revision: int) -> list[dict]:
        return [evidence_summary(item) for item in current_verified_evidence(self.db, target_type, target_id, revision)]

    def _is_public(self, item: Experience) -> bool:
        if item.verification_status == "simulated" and item.poi.verification_status == "simulated":
            return True
        return (
            entity_is_operationally_verified(self.db, "experience", item)
            and entity_is_operationally_verified(self.db, "poi", item.poi)
        )

    def is_fresh_slot(self, slot: ExperienceSlot) -> bool:
        return slot_is_operationally_verified(self.db, slot)
