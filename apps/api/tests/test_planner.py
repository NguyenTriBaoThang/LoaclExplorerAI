from tests.conftest import add_slot

PLAN = {
    "start_at": "2026-10-01T09:00:00+07:00",
    "end_at": "2026-10-01T16:00:00+07:00",
    "group_size": 4,
    "budget_vnd": 1_000_000,
    "transport_mode": "driving",
    "intent_weights": {"handicraft": 1.0},
    "locked_experience_ids": [],
}


def test_feasible_plan(client, db_session, sample_experience):
    add_slot(db_session, sample_experience)
    response = client.post("/api/itineraries/plan", json=PLAN)
    assert response.status_code == 200
    body = response.json()
    assert body["feasibility_status"] == "feasible"
    assert body["estimated_cost_vnd"] == 400_000
    assert len(body["stops"]) == 1
    restored = client.get(f"/api/itineraries/{body['itinerary_id']}")
    assert restored.status_code == 200
    assert restored.json()["stops"][0]["experience_id"] == sample_experience.id


def test_budget_too_low_returns_no_feasible_plan(client, db_session, sample_experience):
    add_slot(db_session, sample_experience)
    response = client.post("/api/itineraries/plan", json={**PLAN, "budget_vnd": 100_000})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "NO_FEASIBLE_PLAN"


def test_insufficient_capacity_is_rejected(client, db_session, sample_experience):
    add_slot(db_session, sample_experience, available=2)
    response = client.post("/api/itineraries/plan", json=PLAN)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "NO_FEASIBLE_PLAN"


def test_slot_outside_trip_window_is_rejected(client, db_session, sample_experience):
    add_slot(db_session, sample_experience, start="2026-10-02T09:00:00+07:00")
    response = client.post("/api/itineraries/plan", json=PLAN)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "NO_FEASIBLE_PLAN"


def test_unknown_capacity_is_tentative_not_full(client, db_session, sample_experience):
    add_slot(db_session, sample_experience, available=None, status="tentative")
    response = client.post("/api/itineraries/plan", json=PLAN)
    assert response.status_code == 200
    body = response.json()
    assert body["feasibility_status"] == "tentative"
    assert body["stops"][0]["availability_known"] is False
    assert "CAPACITY_UNKNOWN" in body["explanation"]["reason_codes"]
