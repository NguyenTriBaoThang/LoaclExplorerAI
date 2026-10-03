from datetime import datetime, timedelta, timezone
from uuid import uuid4

from geoalchemy2.elements import WKTElement
from sqlalchemy import func, select

from app.api.dependencies import get_current_user
from app.models.entities import (
    Booking,
    Evidence,
    Experience,
    ExperienceSlot,
    Itinerary,
    ItineraryStop,
    PaymentTransaction,
    POI,
    Provider,
    User,
)


def _verified_evidence(db_session, target_type, target_id, revision, fields, now, expires):
    db_session.add(Evidence(
        id=str(uuid4()), source_uri="https://example.org/verified-record", source_type="provider_confirmation",
        source_label="Verified source", submitted_by=None, target_type=target_type, target_id=target_id,
        target_revision=revision, fields_covered=fields, observed_at=now - timedelta(minutes=2),
        expires_at=expires, verification_status="verified", verified_at=now - timedelta(minutes=1),
    ))


def _booking_fixture(db_session, quantity_capacity=2, price=100_000):
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(days=2)
    provider = Provider(id=str(uuid4()), name="Verified provider", slug=f"verified-{uuid4().hex[:8]}", is_active=True, verification_status="verified")
    provider_user = User(id=str(uuid4()), email=f"provider-{uuid4().hex[:8]}@example.org", display_name="Provider", role="provider", provider_id=provider.id)
    traveler = User(id=str(uuid4()), email=f"traveler-{uuid4().hex[:8]}@example.org", display_name="Traveler", role="traveler")
    poi = POI(name="Verified POI", description="Workshop", latitude=10.77, longitude=106.7,
              geom=WKTElement("POINT(106.7 10.77)", srid=4326), category="craft", address="Verified address",
              verification_status="verified", data_revision=1)
    experience = Experience(poi=poi, provider=provider, name="Verified workshop", title="Verified workshop",
                            description="Hands-on", intent_tags=["handicraft"], is_hands_on=True,
                            duration_min=60, price_basis="per_person", price_vnd=price,
                            verification_status="verified", data_revision=1)
    slot = ExperienceSlot(experience=experience, start_at=expiry, end_at=expiry + timedelta(hours=1),
                          capacity_total=quantity_capacity, available_reported=quantity_capacity,
                          confirmed_at=now, expires_at=expiry - timedelta(hours=1), status="open", version=1)
    itinerary = Itinerary(user_id=traveler.id, group_size=quantity_capacity, budget_vnd=1_000_000,
                          travel_mode="driving", start_at=expiry - timedelta(hours=1), end_at=expiry + timedelta(hours=2),
                          status="feasible", constraints={}, estimated_cost_vnd=price * quantity_capacity)
    stop = ItineraryStop(itinerary=itinerary, experience=experience, slot=slot, poi=poi, stop_order=1,
                         position=1, arrival_at=expiry, departure_at=expiry + timedelta(hours=1),
                         start_at=expiry, end_at=expiry + timedelta(hours=1), activity_duration_min=60,
                         cost_vnd=price * quantity_capacity)
    db_session.add_all([provider_user, traveler, poi, experience, slot, itinerary, stop])
    db_session.flush()
    _verified_evidence(db_session, "poi", poi.id, poi.data_revision,
                       ["name", "address", "latitude", "longitude", "category"], now, expiry + timedelta(days=20))
    _verified_evidence(db_session, "experience", experience.id, experience.data_revision,
                       ["title", "description", "primary_intent", "intent_tags", "is_hands_on", "duration_min", "price_vnd", "price_basis"], now, expiry + timedelta(days=20))
    _verified_evidence(db_session, "slot", slot.id, slot.version,
                       ["start_at", "end_at", "capacity_total", "available_reported", "status"], now, slot.expires_at)
    db_session.commit()
    return traveler, provider_user, itinerary, stop, slot


def test_booking_hold_capacity_provider_confirmation_and_payment_fail_closed(client, db_session):
    traveler, provider_user, itinerary, stop, slot = _booking_fixture(db_session, quantity_capacity=2, price=125_000)
    current_user = [traveler]
    client.app.dependency_overrides[get_current_user] = lambda: current_user[0]

    response = client.post("/api/bookings", json={"itinerary_id": itinerary.id, "itinerary_stop_id": stop.id, "quantity": 2})
    assert response.status_code == 201, response.text
    booking_id = response.json()["id"]
    assert response.json()["status"] == "pending_provider"
    assert response.json()["amount_vnd"] == 250_000

    # The reservation is counted against available seats before another traveler can request them.
    second_traveler = User(id=str(uuid4()), email=f"second-{uuid4().hex[:8]}@example.org", display_name="Second", role="traveler")
    second_itinerary = Itinerary(user_id=second_traveler.id, group_size=1, budget_vnd=200_000,
                                 start_at=itinerary.start_at, end_at=itinerary.end_at, status="feasible",
                                 constraints={}, estimated_cost_vnd=125_000)
    second_stop = ItineraryStop(itinerary=second_itinerary, experience=stop.experience, slot=slot, poi=stop.poi,
                                stop_order=1, position=1, arrival_at=stop.arrival_at, departure_at=stop.departure_at,
                                start_at=stop.start_at, end_at=stop.end_at, activity_duration_min=60, cost_vnd=125_000)
    db_session.add_all([second_traveler, second_itinerary, second_stop])
    db_session.commit()
    current_user[0] = second_traveler
    rejected = client.post("/api/bookings", json={"itinerary_id": second_itinerary.id, "itinerary_stop_id": second_stop.id, "quantity": 1})
    assert rejected.status_code == 409
    assert rejected.json()["error"]["code"] == "INSUFFICIENT_CAPACITY"

    current_user[0] = provider_user
    accepted = client.post(f"/api/provider/me/bookings/{booking_id}/decision", json={"action": "accept", "note": "Seats checked"})
    assert accepted.status_code == 200, accepted.text
    assert accepted.json()["status"] == "awaiting_payment"
    current_user[0] = traveler
    checkout = client.post(f"/api/bookings/{booking_id}/checkout")
    assert checkout.status_code == 503
    assert checkout.json()["error"]["code"] == "PAYMENT_GATEWAY_NOT_CONFIGURED"
    assert db_session.scalar(select(func.count(PaymentTransaction.id))) == 0
    assert db_session.get(Booking, booking_id).status == "awaiting_payment"
    cancelled = client.post(f"/api/bookings/{booking_id}/cancel", json={"reason": "Plan changed"})
    assert cancelled.status_code == 200, cancelled.text
    assert cancelled.json()["status"] == "cancelled"
    history = client.get(f"/api/bookings/{booking_id}/history")
    assert history.status_code == 200
    assert [row["to_status"] for row in history.json()] == ["pending_provider", "awaiting_payment", "cancelled"]


def test_free_reservation_becomes_confirmed_after_provider_capacity_acceptance(client, db_session):
    traveler, provider_user, itinerary, stop, _slot = _booking_fixture(db_session, quantity_capacity=1, price=0)
    current_user = [traveler]
    client.app.dependency_overrides[get_current_user] = lambda: current_user[0]
    hold = client.post("/api/bookings", json={"itinerary_id": itinerary.id, "itinerary_stop_id": stop.id, "quantity": 1})
    assert hold.status_code == 201, hold.text
    current_user[0] = provider_user
    confirmation = client.post(f"/api/provider/me/bookings/{hold.json()['id']}/decision", json={"action": "accept"})
    assert confirmation.status_code == 200, confirmation.text
    assert confirmation.json()["status"] == "confirmed"
    assert confirmation.json()["confirmed_at"] is not None
