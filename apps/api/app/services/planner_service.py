from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.adapters.routing.provider import MockRoutingProvider
from app.core.config import settings
from app.core.enums import ItineraryStatus, PriceBasis
from app.models.entities import DecisionLog, Experience, ExperienceSlot, Itinerary, ItineraryStop, ItineraryVersion
from app.repositories.experience_repository import ExperienceRepository
from app.schemas.planner import PlanRequest
from app.services.explanation_service import ExplanationService
from app.services.availability_service import AvailabilityService
from app.services.planner_engine import HeuristicPlanner, PlannerEngine
from app.services.recommendation_service import RecommendationService
from app.services.routing_service import RoutingService


class NoFeasiblePlan(Exception):
    pass


def as_aware(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


class PlannerService:
    def __init__(self, db: Session, routing: MockRoutingProvider | None = None, engine: PlannerEngine | None = None):
        self.db = db
        self.repository = ExperienceRepository(db)
        if routing is None and settings.routing_provider != "mock":
            raise RuntimeError(f"Routing provider '{settings.routing_provider}' is not configured")
        self.routing = RoutingService(routing or MockRoutingProvider())
        self.availability = AvailabilityService()
        self.engine = engine or HeuristicPlanner()
        self.recommender = RecommendationService()
        self.explainer = ExplanationService()

    def plan(self, request: PlanRequest) -> dict:
        start_at, end_at = as_aware(request.start_at), as_aware(request.end_at)
        if end_at <= start_at or start_at < datetime.now(timezone.utc):
            raise NoFeasiblePlan("The trip must start in the future and end after it starts")

        experiences = self.repository.list_experiences()
        by_id = {experience.id: experience for experience in experiences}
        if any(experience_id not in by_id for experience_id in request.locked_experience_ids):
            raise NoFeasiblePlan("A locked experience does not exist")

        chosen: list[dict] = []
        chosen_experience_ids: set[str] = set()
        cursor = start_at
        previous_poi: tuple[float, float] | None = None
        total_cost = 0
        total_travel = 0
        routes: list[dict] = []
        reason_codes: set[str] = {"SIMULATED_DATA", "MOCK_ROUTING"}
        unknown_capacity = False

        # Locked experiences are scheduled first in the caller's requested order.
        ordered_ids = list(dict.fromkeys(request.locked_experience_ids))
        remaining = [item for item in experiences if item.id not in ordered_ids]
        pool = [by_id[item] for item in ordered_ids] + remaining

        while len(chosen) < 6:
            candidates: list[dict] = []
            for experience in pool:
                if experience.id in chosen_experience_ids:
                    continue
                locked = experience.id in request.locked_experience_ids
                cost = experience.price_vnd * request.group_size if experience.price_basis == PriceBasis.PER_PERSON.value else experience.price_vnd
                if total_cost + cost > request.budget_vnd:
                    continue
                score, reasons = self.recommender.score(experience, request.intent_weights, request.group_size, request.budget_vnd - total_cost)
                for slot in sorted(experience.slots, key=lambda item: as_aware(item.start_at)):
                    slot_start, slot_end = as_aware(slot.start_at), as_aware(slot.end_at)
                    if slot_start < start_at or slot_end > end_at or slot_end <= cursor:
                        continue
                    if not self.availability.can_fit(slot, request.group_size):
                        continue
                    if previous_poi:
                        leg = self.routing.get_route(previous_poi, (experience.poi.latitude, experience.poi.longitude), request.transport_mode)
                        travel = leg.duration_min
                    else:
                        leg, travel = None, 0
                    if slot_start < cursor + timedelta(minutes=travel):
                        continue
                    capacity_known = self.availability.is_capacity_known(slot)
                    candidates.append({
                        "experience": experience,
                        "slot": slot,
                        "cost": cost,
                        "score": score,
                        "reasons": reasons,
                        "locked": locked,
                        "leg": leg,
                        "travel": travel,
                        "capacity_known": capacity_known,
                    })
            next_item = self.engine.plan(candidates)
            if not next_item:
                break

            experience, slot = next_item["experience"], next_item["slot"]
            slot_start, slot_end = as_aware(slot.start_at), as_aware(slot.end_at)
            if next_item["leg"]:
                total_travel += next_item["travel"]
                routes.append({
                    "from_experience_id": chosen[-1]["experience"].id,
                    "to_experience_id": experience.id,
                    "distance_m": next_item["leg"].distance_m,
                    "duration_min": next_item["leg"].duration_min,
                    "provider": next_item["leg"].provider,
                    "is_realtime": next_item["leg"].is_realtime,
                })
            chosen.append({**next_item, "arrival": slot_start})
            chosen_experience_ids.add(experience.id)
            total_cost += next_item["cost"]
            cursor = slot_end
            previous_poi = (experience.poi.latitude, experience.poi.longitude)
            reason_codes.update(next_item["reasons"])
            reason_codes.add("SLOT_AVAILABLE")
            if next_item["locked"]:
                reason_codes.add("LOCKED_ACTIVITY")
            if not next_item["capacity_known"]:
                unknown_capacity = True
                reason_codes.add("CAPACITY_UNKNOWN")

        if not chosen or any(item not in chosen_experience_ids for item in request.locked_experience_ids):
            raise NoFeasiblePlan("No itinerary satisfies time, capacity, and budget constraints")

        preserved = sorted({tag for item in chosen for tag in item["experience"].intent_tags if request.intent_weights.get(tag, 0) > 0})
        lost = sorted(tag for tag, weight in request.intent_weights.items() if weight > 0 and tag not in preserved)
        status = ItineraryStatus.TENTATIVE.value if unknown_capacity else ItineraryStatus.FEASIBLE.value
        itinerary = Itinerary(
            id=str(uuid4()), group_size=request.group_size, budget_vnd=request.budget_vnd,
            start_at=start_at, end_at=end_at, status=status,
            planned_date=start_at.date(), start_time=start_at, return_deadline=end_at,
            travel_mode=request.transport_mode, target_intents=request.intent_weights, current_version=1,
            constraints={"transport_mode": request.transport_mode, "intent_weights": request.intent_weights, "locked_experience_ids": request.locked_experience_ids},
            estimated_cost_vnd=total_cost, data_mode="simulated",
        )
        self.db.add(itinerary)
        self.db.flush()
        response_stops = []
        version_snapshot = []
        for position, item in enumerate(chosen, start=1):
            experience, slot = item["experience"], item["slot"]
            stop = ItineraryStop(
                id=str(uuid4()), itinerary_id=itinerary.id, experience_id=experience.id, slot_id=slot.id,
                poi_id=experience.poi_id, stop_order=position, position=position,
                arrival_at=item["arrival"], start_at=as_aware(slot.start_at), end_at=as_aware(slot.end_at),
                departure_at=as_aware(slot.end_at), wait_duration_min=0,
                activity_duration_min=experience.duration_min,
                cost_vnd=item["cost"], status="planned", is_locked=item["locked"], locked=item["locked"],
            )
            self.db.add(stop)
            response_stops.append(self._stop_dict(stop, experience, slot, position))
            version_snapshot.append({
                "stop_id": stop.id, "stop_order": position, "poi_id": experience.poi_id,
                "experience_id": experience.id, "slot_id": slot.id,
                "arrival_at": stop.arrival_at.isoformat(), "departure_at": stop.departure_at.isoformat(),
                "cost_vnd": stop.cost_vnd, "is_locked": stop.is_locked,
            })
        self.db.add(ItineraryVersion(
            itinerary_id=itinerary.id, version_number=1, stops_snapshot=version_snapshot,
            total_cost_vnd=total_cost, total_travel_time_s=total_travel * 60,
            preserved_intents_ratio=(len(preserved) / sum(weight > 0 for weight in request.intent_weights.values())) if any(weight > 0 for weight in request.intent_weights.values()) else 1.0,
        ))
        self.db.add(DecisionLog(
            itinerary_id=itinerary.id, base_version=0, new_version=1,
            preserved_intents=preserved, lost_intents=lost,
            comparative_metrics={"estimated_cost_vnd": total_cost, "total_travel_time_s": total_travel * 60},
            explanation_vi="Lịch trình được tạo theo ngân sách, thời gian và mục đích chuyến đi đã chọn.",
            reason_codes=sorted(reason_codes), rejected_candidates=[], model_version="heuristic-v1",
        ))
        self.db.commit()
        return {
            "request_id": itinerary.id,
            "itinerary_id": itinerary.id,
            "data_mode": "simulated",
            "data_as_of": datetime.now(timezone.utc),
            "feasibility_status": status,
            "estimated_cost_vnd": total_cost,
            "total_travel_min": total_travel,
            "stops": response_stops,
            "routes": routes,
            "explanation": self.explainer.explain(sorted(reason_codes), preserved, lost),
        }

    @staticmethod
    def _stop_dict(stop: ItineraryStop, experience: Experience, slot: ExperienceSlot, position: int) -> dict:
        return {
            "id": stop.id or str(uuid4()), "experience_id": experience.id, "slot_id": slot.id,
            "position": position, "name": experience.name, "category": experience.poi.category,
            "arrival_at": as_aware(stop.arrival_at), "start_at": as_aware(slot.start_at), "end_at": as_aware(slot.end_at),
            "duration_min": experience.duration_min, "cost_vnd": experience.price_vnd,
            "locked": stop.locked, "availability_status": slot.status,
            "availability_known": slot.available_reported is not None,
            "poi": {"id": experience.poi.id, "name": experience.poi.name, "description": experience.poi.description,
                    "latitude": experience.poi.latitude, "longitude": experience.poi.longitude,
                    "category": experience.poi.category, "address": experience.poi.address,
                    "verification_status": experience.poi.verification_status, "data_mode": "simulated"},
        }

    def get_itinerary(self, itinerary_id: str) -> dict | None:
        itinerary = self.db.scalar(
            select(Itinerary).where(Itinerary.id == itinerary_id).options(selectinload(Itinerary.stops).joinedload(ItineraryStop.experience).joinedload(Experience.poi), selectinload(Itinerary.stops).joinedload(ItineraryStop.slot))
        )
        if itinerary is None:
            return None
        stops = [self._stop_dict(stop, stop.experience, stop.slot, stop.position) for stop in itinerary.stops]
        routes = []
        travel = 0
        for previous, current in zip(stops, stops[1:]):
            route = self.routing.get_route(
                (previous["poi"]["latitude"], previous["poi"]["longitude"]),
                (current["poi"]["latitude"], current["poi"]["longitude"]),
                itinerary.constraints.get("transport_mode", "driving"),
            )
            travel += route.duration_min
            routes.append({"from_experience_id": previous["experience_id"], "to_experience_id": current["experience_id"], "distance_m": route.distance_m, "duration_min": route.duration_min, "provider": route.provider, "is_realtime": route.is_realtime})
        reasons = ["SIMULATED_DATA", "MOCK_ROUTING", "SLOT_AVAILABLE"]
        if any(not stop["availability_known"] for stop in stops):
            reasons.append("CAPACITY_UNKNOWN")
        intents = itinerary.constraints.get("intent_weights", {})
        preserved = sorted({tag for stop in itinerary.stops for tag in stop.experience.intent_tags if intents.get(tag, 0) > 0})
        return {
            "request_id": itinerary.id, "itinerary_id": itinerary.id, "data_mode": itinerary.data_mode,
            "data_as_of": itinerary.created_at, "feasibility_status": itinerary.status,
            "estimated_cost_vnd": itinerary.estimated_cost_vnd, "total_travel_min": travel, "stops": stops,
            "routes": routes, "explanation": self.explainer.explain(reasons, preserved, sorted(tag for tag, weight in intents.items() if weight > 0 and tag not in preserved)),
        }
