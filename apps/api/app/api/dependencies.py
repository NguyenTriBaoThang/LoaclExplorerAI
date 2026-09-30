from fastapi import Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.services.planner_service import PlannerService


def get_planner_service(db: Session = Depends(get_db)) -> PlannerService:
    return PlannerService(db)
