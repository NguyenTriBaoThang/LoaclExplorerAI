from tests.conftest import add_slot
from sqlalchemy.orm import sessionmaker
from scripts.seed_db import seed


def test_experiences_returns_seed_shape(client, db_session, sample_experience):
    add_slot(db_session, sample_experience)
    response = client.get("/api/experiences")
    assert response.status_code == 200
    body = response.json()
    assert len(body) == 1
    assert body[0]["name"] == "Paper workshop"
    assert body[0]["poi"]["verification_status"] == "simulated"
    assert body[0]["slots"][0]["available_reported"] == 4
    assert body[0]["slots"][0]["start_at"].endswith("Z") or "+00:00" in body[0]["slots"][0]["start_at"]


def test_seed_populates_simulated_experiences(client, db_session):
    seed(sessionmaker(bind=db_session.get_bind(), expire_on_commit=False))
    response = client.get("/api/experiences")
    assert response.status_code == 200
    items = response.json()
    assert len(items) == 10
    assert all(item["verification_status"] == "simulated" for item in items)
    assert all(item["slots"] for item in items)
    assert all(item["data_mode"] == "simulated" for item in items)
