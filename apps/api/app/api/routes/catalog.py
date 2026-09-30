from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.repositories.experience_repository import ExperienceRepository
from app.schemas.common import ExperienceRead, POIRead, SlotRead
from app.services.experience_service import ExperienceService
from app.db.session import get_db

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/pois", response_model=list[POIRead])
def list_pois(db: Session = Depends(get_db)):
    return ExperienceRepository(db).list_pois()


@router.get("/pois/{poi_id}", response_model=POIRead)
def get_poi(poi_id: str, db: Session = Depends(get_db)):
    poi = ExperienceRepository(db).get_poi(poi_id)
    if not poi:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "POI not found"})
    return poi


@router.get("/experiences", response_model=list[ExperienceRead])
def list_experiences(
    intent: str | None = None,
    start_at: datetime | None = None,
    end_at: datetime | None = None,
    group_size: int | None = Query(default=None, ge=1),
    max_price: int | None = Query(default=None, ge=0),
    db: Session = Depends(get_db),
):
    return ExperienceService(ExperienceRepository(db)).list(intent, start_at, end_at, group_size, max_price)


@router.get("/experiences/{experience_id}", response_model=ExperienceRead)
def get_experience(experience_id: str, db: Session = Depends(get_db)):
    experience = ExperienceRepository(db).get_experience(experience_id)
    if not experience:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Experience not found"})
    return experience


@router.get("/experiences/{experience_id}/slots", response_model=list[SlotRead])
def get_slots(experience_id: str, start_at: datetime | None = None, end_at: datetime | None = None, db: Session = Depends(get_db)):
    if not ExperienceRepository(db).get_experience(experience_id):
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Experience not found"})
    return ExperienceRepository(db).list_slots(experience_id, start_at, end_at)
