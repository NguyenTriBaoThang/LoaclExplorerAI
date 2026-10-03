from datetime import datetime, timedelta, timezone
from uuid import uuid4

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload, selectinload

from app.adapters.routing.provider import MockRoutingProvider
from app.core.config import settings
from app.core.enums import ItineraryStatus, PriceBasis, normalize_intent_tag
from app.models.entities import DecisionLog, Experience, ExperienceSlot, Itinerary, ItineraryStop, ItineraryVersion
from app.repositories.experience_repository import ExperienceRepository
from app.schemas.planner import PlanRequest
from app.services.explanation_service import ExplanationService
from app.services.availability_service import AvailabilityService
from app.services.ml_ranker_service import MLRankerUnavailable, ranker_service
from app.services.planner_engine import HeuristicPlanner, PlannerEngine
from app.services.recommendation_service import RecommendationService
from app.services.routing_service import RoutingService


class NoFeasiblePlan(Exception):
    pass


def as_aware(value: datetime) -> datetime:
    return value.replace(tzinfo=timezone.utc) if value.tzinfo is None else value


class PlannerService:
    def __init__(self, db: Session, routing: MockRoutingProvider | None = None,
                 engine: PlannerEngine | None = None, ranker=None):
        self.db = db
        self.repository = ExperienceRepository(db)
        if routing is None and settings.routing_provider != "mock":
            raise RuntimeError(f"Routing provider '{settings.routing_provider}' is not configured")
        self.routing = RoutingService(routing or MockRoutingProvider())
        self.availability = AvailabilityService()
        self.engine = engine or HeuristicPlanner()
        self.ranker = ranker or ranker_service
        self.recommender = RecommendationService()
        self.explainer = ExplanationService()

    def _rank_feasible_candidates(self, candidates: list[dict], request: PlanRequest,
                                  cursor: datetime, end_at: datetime,
                                  budget_remaining_vnd: int) -> str | None:
        """Use the optional ranker as a tie-break only; feasibility stays solver-owned."""
        if (len(candidates) < 2 or any(item["locked"] for item in candidates)
                or not isinstance(self.engine, HeuristicPlanner) or not self.ranker.configured):
            return None

        intent_tags = [tag for tag, weight in request.intent_weights.items() if weight > 0]
        query = {
            "user_intent_text": " ".join(intent_tags),
            "user_intent_tags": intent_tags,
            "remaining_time_min": max(1, (end_at - cursor).total_seconds() / 60),
            "group_size": request.group_size,
            "budget_remaining_vnd": max(0, budget_remaining_vnd),
        }
        rows = []
        candidates_by_key = {}
        for item in candidates:
            experience = item["experience"]
            slot = item["slot"]
            key = (experience.id, slot.id)
            candidates_by_key[key] = item
            rows.append({
                "candidate_experience_id": experience.id,
                "candidate_slot_id": slot.id,
                "candidate_name": experience.name,
                "candidate_tags": experience.intent_tags or [],
                "duration_min": experience.duration_min,
                "price_vnd_per_person": item["cost"] / max(request.group_size, 1),
                "total_cost_vnd": item["cost"],
                "is_hands_on": experience.is_hands_on,
                "is_indoor": experience.is_indoor,
                "eta_min": item["travel"],
                "hard_feasible": True,
            })

        try:
            ranked, filtered_ids, status = self.ranker.rank(query, rows)
        except MLRankerUnavailable:
            return None

        # If the model/service disagrees with the already-validated candidate set,
        # keep the deterministic planner unchanged instead of dropping choices.
        if filtered_ids or len(ranked) != len(candidates):
            return None
        scores = {
            (row["candidate_experience_id"], row["candidate_slot_id"]): row["rank_score"]
            for row in ranked
        }
        if set(scores) != set(candidates_by_key):
            return None
        for key, item in candidates_by_key.items():
            item["score"] = float(scores[key])
        return status.get("model_version") or "local-ranker"

    def plan(self, request: PlanRequest, user_id: str | None = None) -> dict:
        start_at, end_at = as_aware(request.start_at), as_aware(request.end_at)
        if end_at <= start_at or start_at < datetime.now(timezone.utc):
            raise NoFeasiblePlan("The trip must start in the future and end after it starts")

        experiences = self.repository.list_experiences()
        by_id = {experience.id: experience for experience in experiences}
        if any(experience_id not in by_id for experience_id in request.locked_experience_ids):
            raise NoFeasiblePlan("A locked experience does not exist")
        poi_ids = {experience.poi_id for experience in experiences}
        if any(poi_id not in poi_ids for poi_id in request.locked_poi_ids):
            raise NoFeasiblePlan("A locked POI does not exist or has no experience")

        chosen: list[dict] = []
        chosen_experience_ids: set[str] = set()
        chosen_poi_ids: set[str] = set()
        cursor = start_at
        previous_poi: tuple[float, float] | None = (
            (request.origin_latitude, request.origin_longitude)
            if request.origin_latitude is not None and request.origin_longitude is not None else None
        )
        total_cost = 0
        total_travel = 0
        routes: list[dict] = []
        reason_codes: set[str] = {"SIMULATED_DATA", "MOCK_ROUTING"}
        unknown_capacity = False
        ranking_model_version = "heuristic-v1"

        # Locked experiences are scheduled first in the caller's requested order.
        ordered_ids = list(dict.fromkeys(request.locked_experience_ids))
        remaining = [item for item in experiences if item.id not in ordered_ids]
        pool = [by_id[item] for item in ordered_ids] + remaining

        while len(chosen) < 6:
            candidates: list[dict] = []
            for experience in pool:
                if experience.id in chosen_experience_ids:
                    continue
                locked = experience.id in request.locked_experience_ids or (
                    experience.poi_id in request.locked_poi_ids and experience.poi_id not in chosen_poi_ids
                )
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
                    return_leg = None
                    return_travel = 0
                    if request.destination_latitude is not None and request.destination_longitude is not None:
                        return_leg = self.routing.get_route(
                            (experience.poi.latitude, experience.poi.longitude),
                            (request.destination_latitude, request.destination_longitude),
                            request.transport_mode,
                        )
                        return_travel = return_leg.duration_min
                        if slot_end + timedelta(minutes=return_travel) > end_at:
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
                        "return_leg": return_leg,
                        "return_travel": return_travel,
                    })
            used_ranker_version = self._rank_feasible_candidates(
                candidates, request, cursor, end_at, request.budget_vnd - total_cost,
            )
            if used_ranker_version:
                ranking_model_version = used_ranker_version
                reason_codes.add("ML_RANKER")
            next_item = self.engine.plan(candidates)
            if not next_item:
                break

            experience, slot = next_item["experience"], next_item["slot"]
            slot_start, slot_end = as_aware(slot.start_at), as_aware(slot.end_at)
            if next_item["leg"]:
                total_travel += next_item["travel"]
                routes.append({
                    "from_experience_id": chosen[-1]["experience"].id if chosen else None,
                    "to_experience_id": experience.id,
                    "from_label": None if chosen else (request.origin_label or "Điểm xuất phát"),
                    "distance_m": next_item["leg"].distance_m,
                    "duration_min": next_item["leg"].duration_min,
                    "provider": next_item["leg"].provider,
                    "is_realtime": next_item["leg"].is_realtime,
                })
            chosen.append({**next_item, "arrival": slot_start})
            chosen_experience_ids.add(experience.id)
            chosen_poi_ids.add(experience.poi_id)
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

        if not chosen or any(item not in chosen_experience_ids for item in request.locked_experience_ids) or not set(request.locked_poi_ids).issubset(chosen_poi_ids):
            raise NoFeasiblePlan("No itinerary satisfies time, capacity, and budget constraints")

        estimated_return_at = as_aware(chosen[-1]["slot"].end_at)
        if request.destination_latitude is not None and request.destination_longitude is not None:
            final = chosen[-1]
            route = final["return_leg"]
            if route:
                total_travel += final["return_travel"]
                estimated_return_at += timedelta(minutes=final["return_travel"])
                routes.append({
                    "from_experience_id": final["experience"].id,
                    "to_experience_id": None,
                    "to_label": request.destination_label or "Điểm về",
                    "distance_m": route.distance_m,
                    "duration_min": route.duration_min,
                    "provider": route.provider,
                    "is_realtime": route.is_realtime,
                })

        requested_intents = {tag for tag, weight in request.intent_weights.items() if weight > 0}
        provided_intents = {normalize_intent_tag(tag) for item in chosen for tag in item["experience"].intent_tags}
        preserved = sorted(tag for tag in requested_intents if normalize_intent_tag(tag) in provided_intents)
        lost = sorted(requested_intents - set(preserved))
        status = ItineraryStatus.TENTATIVE.value if unknown_capacity else ItineraryStatus.FEASIBLE.value
        itinerary = Itinerary(
            id=str(uuid4()), user_id=user_id, group_size=request.group_size, budget_vnd=request.budget_vnd,
            start_at=start_at, end_at=end_at, status=status,
            planned_date=start_at.date(), start_time=start_at, return_deadline=end_at,
            travel_mode=request.transport_mode, target_intents=request.intent_weights, current_version=1,
            origin_latitude=request.origin_latitude, origin_longitude=request.origin_longitude,
            destination_latitude=request.destination_latitude, destination_longitude=request.destination_longitude,
            constraints={"transport_mode": request.transport_mode, "intent_weights": request.intent_weights,
                         "locked_experience_ids": request.locked_experience_ids, "locked_poi_ids": request.locked_poi_ids,
                         "origin_latitude": request.origin_latitude, "origin_longitude": request.origin_longitude,
                         "destination_latitude": request.destination_latitude, "destination_longitude": request.destination_longitude,
                         "origin_label": request.origin_label, "destination_label": request.destination_label},
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
        explanation = self.explainer.explain(sorted(reason_codes), preserved, lost)
        explanation["ranking_model_version"] = ranking_model_version if "ML_RANKER" in reason_codes else None
        self.db.add(DecisionLog(
            itinerary_id=itinerary.id, base_version=0, new_version=1,
            preserved_intents=preserved, lost_intents=lost,
            comparative_metrics={"estimated_cost_vnd": total_cost, "total_travel_time_s": total_travel * 60},
            explanation_vi="Lịch trình được tạo theo ngân sách, thời gian và mục đích chuyến đi đã chọn.",
            reason_codes=sorted(reason_codes), rejected_candidates=[], model_version=ranking_model_version,
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
            "start_at": start_at,
            "return_deadline": end_at,
            "estimated_return_at": estimated_return_at,
            "stops": response_stops,
            "routes": routes,
            "explanation": explanation,
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
        mode = itinerary.constraints.get("transport_mode", "driving")
        if stops and itinerary.origin_latitude is not None and itinerary.origin_longitude is not None:
            first = stops[0]
            route = self.routing.get_route((itinerary.origin_latitude, itinerary.origin_longitude),
                                           (first["poi"]["latitude"], first["poi"]["longitude"]), mode)
            travel += route.duration_min
            routes.append({"from_experience_id": None, "to_experience_id": first["experience_id"],
                           "from_label": itinerary.constraints.get("origin_label") or "Điểm xuất phát",
                           "distance_m": route.distance_m, "duration_min": route.duration_min,
                           "provider": route.provider, "is_realtime": route.is_realtime})
        for previous, current in zip(stops, stops[1:]):
            route = self.routing.get_route(
                (previous["poi"]["latitude"], previous["poi"]["longitude"]),
                (current["poi"]["latitude"], current["poi"]["longitude"]),
                mode,
            )
            travel += route.duration_min
            routes.append({"from_experience_id": previous["experience_id"], "to_experience_id": current["experience_id"], "distance_m": route.distance_m, "duration_min": route.duration_min, "provider": route.provider, "is_realtime": route.is_realtime})
        if stops and itinerary.destination_latitude is not None and itinerary.destination_longitude is not None:
            last = stops[-1]
            route = self.routing.get_route((last["poi"]["latitude"], last["poi"]["longitude"]),
                                           (itinerary.destination_latitude, itinerary.destination_longitude), mode)
            travel += route.duration_min
            routes.append({"from_experience_id": last["experience_id"], "to_experience_id": None,
                           "to_label": itinerary.constraints.get("destination_label") or "Điểm về",
                           "distance_m": route.distance_m, "duration_min": route.duration_min,
                           "provider": route.provider, "is_realtime": route.is_realtime})
        reasons = ["SIMULATED_DATA", "MOCK_ROUTING", "SLOT_AVAILABLE"]
        if any(not stop["availability_known"] for stop in stops):
            reasons.append("CAPACITY_UNKNOWN")
        intents = itinerary.constraints.get("intent_weights", {})
        requested_intents = {tag for tag, weight in intents.items() if weight > 0}
        provided_intents = {normalize_intent_tag(tag) for stop in itinerary.stops for tag in stop.experience.intent_tags}
        preserved = sorted(tag for tag in requested_intents if normalize_intent_tag(tag) in provided_intents)
        return {
            "request_id": itinerary.id, "itinerary_id": itinerary.id, "data_mode": itinerary.data_mode,
            "data_as_of": itinerary.created_at, "feasibility_status": itinerary.status,
            "estimated_cost_vnd": itinerary.estimated_cost_vnd, "total_travel_min": travel, "stops": stops,
            "start_at": as_aware(itinerary.start_time or itinerary.start_at),
            "return_deadline": as_aware(itinerary.return_deadline or itinerary.end_at),
            "estimated_return_at": (as_aware(stops[-1]["end_at"]) if stops else as_aware(itinerary.end_at)) + timedelta(minutes=(routes[-1]["duration_min"] if routes and routes[-1].get("to_experience_id") is None else 0)),
            "routes": routes, "explanation": self.explainer.explain(reasons, preserved, sorted(requested_intents - set(preserved))),
        }
