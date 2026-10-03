from app.services.ranker_features import build_feature_row, is_hard_feasible


def test_ranker_features_use_csv_contract_and_preserve_missing_weather():
    query = {
        "user_intent_tags": "thủ_công; workshop; indoor",
        "remaining_time_min": 180,
        "group_size": 2,
        "budget_remaining_vnd": 800_000,
    }
    candidate = {
        "candidate_tags": "Thủ công thực hành; indoor",
        "duration_min": 75,
        "price_vnd_per_person": 280_000,
        "is_hands_on": True,
        "is_indoor": True,
        "eta_min": 25,
    }
    features = build_feature_row(query, candidate)
    assert features["tag_jaccard"] > 0
    assert features["intent_match"] == 1
    assert features["total_time_ratio"] == 100 / 180
    assert features["group_cost_ratio"] == 560_000 / 800_000
    assert features["rain_mm"] != features["rain_mm"]  # NaN means unknown, not dry.
    assert is_hard_feasible(query, candidate)


def test_ranker_features_reject_over_budget_or_over_time_candidate():
    query = {"remaining_time_min": 90, "group_size": 2, "budget_remaining_vnd": 100_000}
    candidate = {"duration_min": 60, "eta_min": 40, "price_vnd_per_person": 100_000}
    assert not is_hard_feasible(query, candidate)


def test_model_routes_fail_closed_when_artifacts_are_missing(client):
    status = client.get("/api/ml/status")
    assert status.status_code == 200
    assert status.json()["experience_ranker"]["configured"] is False
    assert status.json()["flood_risk_model"]["configured"] is False

    ranking = client.post("/api/ml/rank-experiences", json={
        "query": {
            "user_intent_text": "workshop thủ công indoor",
            "user_intent_tags": ["thủ_công", "indoor"],
            "remaining_time_min": 180,
            "group_size": 2,
            "budget_remaining_vnd": 800000,
        },
        "candidates": [{
            "candidate_experience_id": "candidate-1",
            "candidate_name": "Tranh trúc chỉ",
            "candidate_tags": ["Thủ công thực hành", "indoor"],
            "duration_min": 75,
            "price_vnd_per_person": 280000,
            "is_hands_on": True,
            "is_indoor": True,
            "eta_min": 25,
            "hard_feasible": True,
        }],
    })
    assert ranking.status_code == 503
    assert ranking.json()["error"]["code"] == "RANKER_NOT_READY"

    flood = client.post("/api/ml/flood-risk", json={"samples": [{
        "edge_id": "edge-1",
        "decision_time": "2026-10-02T10:00:00+07:00",
        "horizon_min": 30,
    }]})
    assert flood.status_code == 503
    assert flood.json()["error"]["code"] == "FLOOD_MODEL_NOT_READY"
