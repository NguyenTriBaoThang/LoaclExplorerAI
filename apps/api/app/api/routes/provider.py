from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.api.dependencies import get_db, require_roles
from app.models.entities import AuditLog, Event, Experience, ExperienceSlot, ItineraryStop, POI, Provider, User
from app.schemas.management import ExperienceDraftRequest, SlotCreateRequest, SlotUpdateRequest
from app.services.auth_service import hash_password

router = APIRouter(prefix="/api/provider", tags=["provider portal"])


def _provider(db: Session, user: User) -> Provider:
    provider = db.get(Provider, user.provider_id) if user.provider_id else None
    if provider is None or not provider.is_active:
        raise HTTPException(status_code=403, detail={"code": "PROVIDER_PROFILE_REQUIRED", "message": "This account has no active provider profile."})
    return provider


def _audit(db: Session, actor: User, action: str, target_type: str, target_id: str, details: dict | None = None) -> None:
    db.add(AuditLog(id=str(uuid4()), actor_id=actor.id, action=action, target_type=target_type, target_id=target_id, details=details or {}, created_at=datetime.now(timezone.utc)))


@router.get("/me")
def provider_profile(user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    return {"id": provider.id, "name": provider.name, "slug": provider.slug, "description": provider.description,
            "contact_phone": provider.contact_phone, "contact_email": provider.contact_email, "address": provider.address,
            "verification_status": provider.verification_status}


@router.get("/experiences")
def list_provider_experiences(user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    items = db.scalars(select(Experience).where(Experience.provider_id == provider.id).options(joinedload(Experience.poi))).unique().all()
    return [{"id": item.id, "poi_id": item.poi_id, "title": item.title, "description": item.description,
             "intent_tags": item.intent_tags, "is_hands_on": item.is_hands_on, "is_indoor": item.is_indoor,
             "duration_min": item.duration_min, "price_vnd": item.price_vnd, "price_basis": item.price_basis,
             "verification_status": item.verification_status, "poi_name": item.poi.name,
             "slots": [{"id": slot.id, "start_at": slot.start_at, "end_at": slot.end_at,
                        "capacity_total": slot.capacity_total, "available_reported": slot.available_reported,
                        "status": slot.status, "version": slot.version} for slot in item.slots]}
            for item in items]


@router.post("/experiences", status_code=201)
def create_experience(payload: ExperienceDraftRequest, user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    poi = db.get(POI, payload.poi_id)
    if poi is None:
        raise HTTPException(status_code=404, detail={"code": "POI_NOT_FOUND", "message": "Choose an existing point of interest."})
    item = Experience(id=str(uuid4()), provider_id=provider.id, poi_id=poi.id, name=payload.title, title=payload.title,
                      description=payload.description, intent_tags=payload.intent_tags, is_hands_on=payload.is_hands_on,
                      is_indoor=payload.is_indoor, indoor=payload.is_indoor, duration_min=payload.duration_min,
                      price_basis=payload.price_basis, price_vnd=payload.price_vnd, verification_status="pending")
    db.add(item)
    db.flush()
    _audit(db, user, "experience.created", "experience", item.id, {"status": "pending"})
    db.commit()
    return {"id": item.id, "verification_status": item.verification_status}


@router.patch("/experiences/{experience_id}")
def update_experience(experience_id: str, payload: ExperienceDraftRequest, user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    item = db.scalar(select(Experience).where(Experience.id == experience_id, Experience.provider_id == provider.id))
    if item is None:
        raise HTTPException(status_code=404, detail={"code": "EXPERIENCE_NOT_FOUND", "message": "Experience not found for this provider."})
    if db.get(POI, payload.poi_id) is None:
        raise HTTPException(status_code=404, detail={"code": "POI_NOT_FOUND", "message": "Choose an existing point of interest."})
    old_status = item.verification_status
    for key, value in payload.model_dump().items():
        if key == "title":
            item.name = value
            item.title = value
        elif key == "is_indoor":
            item.indoor = value
            item.is_indoor = value
        else:
            setattr(item, key, value)
    if old_status == "verified":
        item.verification_status = "pending"
    _audit(db, user, "experience.updated", "experience", item.id, {"review_reset": old_status == "verified"})
    db.commit()
    return {"id": item.id, "verification_status": item.verification_status}


@router.delete("/experiences/{experience_id}")
def hide_experience(experience_id: str, user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    item = db.scalar(select(Experience).where(Experience.id == experience_id, Experience.provider_id == provider.id))
    if item is None:
        raise HTTPException(status_code=404, detail={"code": "EXPERIENCE_NOT_FOUND", "message": "Experience not found for this provider."})
    item.verification_status = "hidden"
    _audit(db, user, "experience.hidden", "experience", item.id, {"soft_delete": True})
    db.commit()
    return {"id": item.id, "verification_status": item.verification_status}


@router.post("/experiences/{experience_id}/slots", status_code=201)
def create_slot(experience_id: str, payload: SlotCreateRequest, user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    item = db.scalar(select(Experience).where(Experience.id == experience_id, Experience.provider_id == provider.id))
    if item is None:
        raise HTTPException(status_code=404, detail={"code": "EXPERIENCE_NOT_FOUND", "message": "Experience not found for this provider."})
    if payload.end_at <= payload.start_at:
        raise HTTPException(status_code=422, detail={"code": "INVALID_SLOT_RANGE", "message": "Slot end must be after start."})
    slot = ExperienceSlot(id=str(uuid4()), experience_id=item.id, start_at=payload.start_at, end_at=payload.end_at,
                          capacity_total=payload.capacity_total, available_reported=payload.available_reported,
                          status="open" if payload.available_reported else "full", version=1)
    db.add(slot)
    _audit(db, user, "slot.created", "experience_slot", slot.id, {"experience_id": item.id})
    db.commit()
    return {"id": slot.id, "version": slot.version, "status": slot.status}


@router.patch("/slots/{slot_id}")
def update_slot(slot_id: str, payload: SlotUpdateRequest, user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    slot = db.scalar(select(ExperienceSlot).join(Experience).where(ExperienceSlot.id == slot_id, Experience.provider_id == provider.id).with_for_update())
    if slot is None:
        raise HTTPException(status_code=404, detail={"code": "SLOT_NOT_FOUND", "message": "Slot not found for this provider."})
    if slot.version != payload.expected_version:
        raise HTTPException(status_code=409, detail={"code": "SLOT_VERSION_CHANGED", "message": "Reload the slot and retry with its latest version."})
    if payload.capacity_total is not None:
        slot.capacity_total = payload.capacity_total
    previous_status = slot.status
    if payload.status == "full" and payload.available_reported not in (None, 0):
        raise HTTPException(status_code=422, detail={"code": "FULL_SLOT_HAS_CAPACITY", "message": "A full slot cannot report available seats."})
    if payload.status == "open" and payload.available_reported == 0:
        raise HTTPException(status_code=422, detail={"code": "OPEN_SLOT_HAS_NO_CAPACITY", "message": "Use full status when no seats remain."})
    slot.status = payload.status
    if payload.available_reported is not None:
        if slot.capacity_total is not None and payload.available_reported > slot.capacity_total:
            raise HTTPException(status_code=422, detail={"code": "CAPACITY_EXCEEDED", "message": "Available seats cannot exceed total capacity."})
        slot.available_reported = payload.available_reported
    if slot.status == "cancelled" and previous_status != "cancelled":
        slot.available_reported = 0
        db.add(Event(event_type="SLOT_CANCELLED", target_type="experience_slot", target_id=slot.id,
                     status="active", event_metadata={"source": "provider_portal", "provider_id": provider.id}))
    elif previous_status == "cancelled" and slot.status != "cancelled":
        active_events = db.scalars(select(Event).where(Event.target_id == slot.id, Event.event_type == "SLOT_CANCELLED", Event.status == "active")).all()
        for event in active_events:
            event.status = "resolved"
    slot.version += 1
    affected = db.scalar(select(func.count(func.distinct(ItineraryStop.itinerary_id))).where(ItineraryStop.slot_id == slot.id, ItineraryStop.status == "planned")) or 0
    _audit(db, user, "slot.updated", "experience_slot", slot.id, {"status": slot.status, "affected_itineraries": affected})
    db.commit()
    return {"id": slot.id, "version": slot.version, "status": slot.status, "available_reported": slot.available_reported,
            "affected_itineraries": affected}


@router.get("/audit")
def provider_audit(user: User = Depends(require_roles("provider")), db: Session = Depends(get_db)):
    provider = _provider(db, user)
    experience_ids = db.scalars(select(Experience.id).where(Experience.provider_id == provider.id)).all()
    slot_ids = db.scalars(select(ExperienceSlot.id).join(Experience).where(Experience.provider_id == provider.id)).all()
    target_ids = [*experience_ids, *slot_ids]
    if not target_ids:
        return []
    logs = db.scalars(select(AuditLog).where(
        AuditLog.target_id.in_(target_ids)
    ).order_by(AuditLog.created_at.desc()).limit(100)).all()
    return [{"id": log.id, "action": log.action, "target_type": log.target_type, "target_id": log.target_id,
             "details": log.details, "created_at": log.created_at} for log in logs]
