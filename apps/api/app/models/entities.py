from datetime import datetime, timezone
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import ItineraryStatus, PriceBasis, SlotStatus, VerificationStatus, enum_values
from app.db.base import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Provider(Base):
    __tablename__ = "providers"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(180))
    description: Mapped[str] = mapped_column(Text, default="")
    contact_phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    contact_email: Mapped[str | None] = mapped_column(String(254), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    experiences: Mapped[list["Experience"]] = relationship(back_populates="provider")


class POI(Base):
    __tablename__ = "pois"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name: Mapped[str] = mapped_column(String(180), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    latitude: Mapped[float]
    longitude: Mapped[float]
    category: Mapped[str] = mapped_column(String(40), index=True)
    address: Mapped[str] = mapped_column(String(300), default="")
    verification_status: Mapped[str] = mapped_column(String(24), default=VerificationStatus.SIMULATED.value)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    experiences: Mapped[list["Experience"]] = relationship(back_populates="poi")


class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    poi_id: Mapped[str] = mapped_column(ForeignKey("pois.id", ondelete="CASCADE"), index=True)
    provider_id: Mapped[str] = mapped_column(ForeignKey("providers.id", ondelete="RESTRICT"), index=True)
    name: Mapped[str] = mapped_column(String(180), index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    intent_tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    duration_min: Mapped[int] = mapped_column(Integer)
    indoor: Mapped[bool] = mapped_column(Boolean, default=True)
    price_basis: Mapped[str] = mapped_column(String(24), default=PriceBasis.PER_PERSON.value)
    price_vnd: Mapped[int] = mapped_column(Integer, default=0)
    verification_status: Mapped[str] = mapped_column(String(24), default=VerificationStatus.SIMULATED.value)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    poi: Mapped[POI] = relationship(back_populates="experiences")
    provider: Mapped[Provider] = relationship(back_populates="experiences")
    slots: Mapped[list["ExperienceSlot"]] = relationship(back_populates="experience", cascade="all, delete-orphan")


class ExperienceSlot(Base):
    __tablename__ = "experience_slots"
    __table_args__ = (UniqueConstraint("experience_id", "start_at", name="uq_slot_experience_start"),)

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    experience_id: Mapped[str] = mapped_column(ForeignKey("experiences.id", ondelete="CASCADE"), index=True)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    capacity_total: Mapped[int | None] = mapped_column(Integer, nullable=True)
    available_reported: Mapped[int | None] = mapped_column(Integer, nullable=True)
    confirmed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(24), default=SlotStatus.TENTATIVE.value)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    experience: Mapped[Experience] = relationship(back_populates="slots")


class Itinerary(Base):
    __tablename__ = "itineraries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    version: Mapped[int] = mapped_column(Integer, default=1)
    group_size: Mapped[int] = mapped_column(Integer)
    budget_vnd: Mapped[int] = mapped_column(Integer)
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    status: Mapped[str] = mapped_column(String(24), default=ItineraryStatus.DRAFT.value)
    constraints: Mapped[dict] = mapped_column(JSON, default=dict)
    estimated_cost_vnd: Mapped[int] = mapped_column(Integer, default=0)
    data_mode: Mapped[str] = mapped_column(String(24), default="simulated")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)
    stops: Mapped[list["ItineraryStop"]] = relationship(back_populates="itinerary", cascade="all, delete-orphan", order_by="ItineraryStop.position")


class ItineraryStop(Base):
    __tablename__ = "itinerary_stops"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    itinerary_id: Mapped[str] = mapped_column(ForeignKey("itineraries.id", ondelete="CASCADE"), index=True)
    experience_id: Mapped[str] = mapped_column(ForeignKey("experiences.id", ondelete="RESTRICT"), index=True)
    slot_id: Mapped[str] = mapped_column(ForeignKey("experience_slots.id", ondelete="RESTRICT"), index=True)
    position: Mapped[int] = mapped_column(Integer)
    arrival_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    start_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    end_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    cost_vnd: Mapped[int] = mapped_column(Integer)
    locked: Mapped[bool] = mapped_column(Boolean, default=False)
    itinerary: Mapped[Itinerary] = relationship(back_populates="stops")
    experience: Mapped[Experience] = relationship()
    slot: Mapped[ExperienceSlot] = relationship()


class Evidence(Base):
    __tablename__ = "evidence"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    source_uri: Mapped[str] = mapped_column(String(1000))
    source_type: Mapped[str] = mapped_column(String(40))
    license: Mapped[str | None] = mapped_column(String(120), nullable=True)
    verified_by: Mapped[str | None] = mapped_column(String(180), nullable=True)
    verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    valid_from: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)


class DecisionLog(Base):
    __tablename__ = "decision_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    itinerary_id: Mapped[str] = mapped_column(ForeignKey("itineraries.id", ondelete="CASCADE"), index=True)
    snapshot_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    reason_codes: Mapped[list[str]] = mapped_column(JSON, default=list)
    rejected_candidates: Mapped[list[dict]] = mapped_column(JSON, default=list)
    model_version: Mapped[str] = mapped_column(String(80), default="heuristic-v1")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
