from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.entities import Experience, ExperienceSlot, POI


class ExperienceRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_experiences(self, intent: str | None = None, max_price: int | None = None) -> list[Experience]:
        query = select(Experience).options(joinedload(Experience.poi), selectinload(Experience.slots))
        if max_price is not None:
            query = query.where(Experience.price_vnd <= max_price)
        items = list(self.db.scalars(query.order_by(Experience.name)).unique())
        if intent:
            items = [item for item in items if intent in (item.intent_tags or [])]
        return items

    def get_experience(self, experience_id: str) -> Experience | None:
        return self.db.scalar(
            select(Experience)
            .where(Experience.id == experience_id)
            .options(joinedload(Experience.poi), selectinload(Experience.slots))
        )

    def list_pois(self) -> list[POI]:
        return list(self.db.scalars(select(POI).order_by(POI.name)))

    def get_poi(self, poi_id: str) -> POI | None:
        return self.db.get(POI, poi_id)

    def list_slots(self, experience_id: str, start_at: datetime | None = None, end_at: datetime | None = None) -> list[ExperienceSlot]:
        query = select(ExperienceSlot).where(ExperienceSlot.experience_id == experience_id).order_by(ExperienceSlot.start_at)
        if start_at:
            query = query.where(ExperienceSlot.start_at >= start_at)
        if end_at:
            query = query.where(ExperienceSlot.end_at <= end_at)
        return list(self.db.scalars(query))
