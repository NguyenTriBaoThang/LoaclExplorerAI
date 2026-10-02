from uuid import uuid4

from app.models.entities import User
from app.services.auth_service import hash_password


def test_registration_creates_traveler_session_and_profile(client):
    response = client.post("/api/auth/register", json={
        "email": "new.traveler@example.com",
        "display_name": "New Traveler",
        "password": "long-enough-password",
    })

    assert response.status_code == 201
    assert response.json()["role"] == "traveler"
    assert "httponly" in response.headers["set-cookie"].lower()
    profile = client.get("/api/auth/me")
    assert profile.status_code == 200
    assert profile.json()["email"] == "new.traveler@example.com"


def test_traveler_cannot_open_admin_routes(client):
    response = client.post("/api/auth/register", json={
        "email": "traveler@example.com",
        "display_name": "Traveler",
        "password": "long-enough-password",
    })
    assert response.status_code == 201

    denied = client.get("/api/admin/dashboard")
    assert denied.status_code == 403
    assert denied.json()["error"]["code"] == "ROLE_FORBIDDEN"


def test_email_login_and_logout(client, db_session):
    user = User(id=str(uuid4()), email="login@example.com", display_name="Login User",
                password_hash=hash_password("long-enough-password"), role="traveler")
    db_session.add(user)
    db_session.commit()

    response = client.post("/api/auth/login", json={"email": "LOGIN@example.com", "password": "long-enough-password"})
    assert response.status_code == 200
    assert client.get("/api/auth/me").status_code == 200
    assert client.post("/api/auth/logout").status_code == 204
    assert client.get("/api/auth/me").status_code == 401
