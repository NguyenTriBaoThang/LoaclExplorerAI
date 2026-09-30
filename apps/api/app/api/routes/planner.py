from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.planner import PlanRequest, PlanResponse
from app.services.planner_service import NoFeasiblePlan, PlannerService

router = APIRouter(prefix="/api", tags=["planner"])


@router.post("/itineraries/plan", response_model=PlanResponse)
def plan_itinerary(payload: PlanRequest, db: Session = Depends(get_db)):
    try:
        return PlannerService(db).plan(payload)
    except NoFeasiblePlan as error:
        raise HTTPException(status_code=422, detail={"code": "NO_FEASIBLE_PLAN", "message": str(error)}) from error


@router.get("/itineraries/{itinerary_id}", response_model=PlanResponse)
def get_itinerary(itinerary_id: str, db: Session = Depends(get_db)):
    result = PlannerService(db).get_itinerary(itinerary_id)
    if not result:
        raise HTTPException(status_code=404, detail={"code": "NOT_FOUND", "message": "Itinerary not found"})
    return result
