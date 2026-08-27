"""
Arogya Link — tests/test_doctor_queue.py
===========================================
Phase 6 — Doctor Queue Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.deps import AuthUser, get_current_user
from app.main import create_app

app = create_app()
client = TestClient(app)

mock_doctor_user = AuthUser(
    id="doc-123",
    sub="user_doc_123",
    role="doctor",
    email="doctor@arogyalink.in",
    full_name="Dr. Ananya Roy",
)

app.dependency_overrides[get_current_user] = lambda: mock_doctor_user


def test_doctor_queue_unauthenticated():
    """GET /queue/encounters without doctor auth override returns 401."""
    # Temporarily remove override
    app.dependency_overrides.pop(get_current_user, None)
    res = client.get("/queue/encounters")
    assert res.status_code == 401
    # Restore override
    app.dependency_overrides[get_current_user] = lambda: mock_doctor_user


def test_doctor_queue_authenticated_list():
    """GET /queue/encounters as authenticated doctor returns encounter list."""
    res = client.get("/queue/encounters")
    assert res.status_code == 200
    assert isinstance(res.json(), list)


def test_doctor_queue_clinical_bundle():
    """GET /queue/encounter/{id} returns complete clinical bundle."""
    # 1. Create session & consent & answers
    r1 = client.post("/session", json={"full_name": "Queue Test Patient", "age": 45})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})
    client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_chief_complaint",
        "answer_value": ["fever"]
    })

    # 2. Fetch bundle
    res = client.get(f"/queue/encounter/{enc_id}")
    assert res.status_code == 200
    data = res.json()
    assert data["encounter_id"] == enc_id
    assert data["patient_name"] == "Queue Test Patient"
    assert data["consented"] is True
    assert "q_chief_complaint" in data["answers"]
