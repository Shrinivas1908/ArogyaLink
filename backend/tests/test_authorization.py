"""
Arogya Link — tests/test_authorization.py
============================================
Authorization & Role-Based Access Control (RBAC) integration tests.

Per Phase 2 plan (Person 3):
  - Requesting /staff endpoints without token returns 401.
  - Doctor role trying to access admin endpoints returns 403.
  - Admin role accessing admin endpoints returns 200/400/404 appropriate status.
  - Verify require_doctor and require_admin dependencies.
"""

from __future__ import annotations

from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.core.deps import AuthUser, get_current_user
from app.core.database import get_db
from app.main import create_app

app = create_app()
client = TestClient(app)


def test_staff_me_unauthenticated():
    """GET /staff/me without token must return 401."""
    app.dependency_overrides.clear()
    r = client.get("/staff/me")
    assert r.status_code == 401


def test_list_staff_unauthenticated():
    """GET /staff without token must return 401."""
    app.dependency_overrides.clear()
    r = client.get("/staff")
    assert r.status_code == 401


@patch("app.core.deps.get_jwks")
@patch("jwt.decode")
@patch("jwt.get_unverified_header")
@patch("jwt.algorithms.RSAAlgorithm.from_jwk")
def test_staff_me_authenticated(mock_from_jwk, mock_get_header, mock_decode, mock_get_jwks):
    """GET /staff/me with valid token returns current user profile."""
    app.dependency_overrides.clear()
    mock_get_jwks.return_value = {"keys": [{"kid": "test-kid"}]}
    mock_get_header.return_value = {"kid": "test-kid"}
    mock_from_jwk.return_value = "dummy-public-key"
    mock_decode.return_value = {
        "sub": "00000000-0000-0000-0000-000000000001",
        "email": "doctor@arogyasetu.in",
        "aud": "authenticated",
    }

    headers = {"Authorization": "Bearer valid.token.jwt"}
    r = client.get("/staff/me", headers=headers)
    assert r.status_code == 200
    data = r.json()
    assert data["id"] == "00000000-0000-0000-0000-000000000001"
    assert data["email"] == "doctor@arogyasetu.in"


def test_list_staff_as_doctor_returns_403():
    """GET /staff with doctor role must return 403 Forbidden."""
    async def override_get_current_user():
        return AuthUser(
            id="00000000-0000-0000-0000-000000000001",
            email="doctor@arogyasetu.in",
            role="doctor",
            active=True,
        )

    app.dependency_overrides[get_current_user] = override_get_current_user
    try:
        headers = {"Authorization": "Bearer doctor.token.jwt"}
        r = client.get("/staff", headers=headers)
        assert r.status_code == 403
        assert "Admin access required" in r.json()["message"]
    finally:
        app.dependency_overrides.clear()


def test_deactivate_staff_as_doctor_returns_403():
    """POST /staff/{id}/deactivate with doctor role must return 403 Forbidden."""
    async def override_get_current_user():
        return AuthUser(
            id="00000000-0000-0000-0000-000000000001",
            email="doctor@arogyasetu.in",
            role="doctor",
            active=True,
        )

    app.dependency_overrides[get_current_user] = override_get_current_user
    try:
        headers = {"Authorization": "Bearer doctor.token.jwt"}
        r = client.post("/staff/00000000-0000-0000-0000-000000000002/deactivate", headers=headers)
        assert r.status_code == 403
        assert "Admin access required" in r.json()["message"]
    finally:
        app.dependency_overrides.clear()


def test_deactivate_staff_invalid_uuid_as_admin():
    """POST /staff/invalid-uuid/deactivate as admin must return 400 Bad Request."""
    async def override_get_current_user():
        return AuthUser(
            id="00000000-0000-0000-0000-000000000099",
            email="admin@arogyasetu.in",
            role="admin",
            active=True,
        )

    async def override_get_db():
        mock_session = AsyncMock()
        yield mock_session

    app.dependency_overrides[get_current_user] = override_get_current_user
    app.dependency_overrides[get_db] = override_get_db
    try:
        headers = {"Authorization": "Bearer admin.token.jwt"}
        r = client.post("/staff/invalid-uuid/deactivate", headers=headers)
        assert r.status_code == 400
        assert "Invalid UUID format" in r.json()["message"]
    finally:
        app.dependency_overrides.clear()
