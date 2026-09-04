"""
Arogya Link — tests/test_session_consent.py
=============================================
Integration tests for Patient Session creation, Consent recording, and Encounter validation.

Per Phase 3 plan (Person 3):
  - POST /session creates Patient and Encounter rows.
  - POST /consent records versioned patient consent.
  - GET /session/{encounter_id} returns session state.
  - validate_consented_encounter dependency rejects invalid/unconsented encounters.
"""

from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.session_deps import validate_consented_encounter
from app.main import create_app
from app.models.patient import Consent, Encounter, Patient

app = create_app()
client = TestClient(app)


def test_create_session_success():
    """POST /session creates a patient and an active encounter when OTP is verified."""
    payload = {
        "full_name": "Radha Devi",
        "age": 42,
        "gender": "Female",
        "phone": "+919876543210",
        "otp": "123456",
        "kiosk_id": "kiosk-north",
    }
    r = client.post("/session", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "encounter_id" in data
    assert "patient_id" in data
    assert data["status"] == "in_progress"
    
    # Validate UUID formats
    uuid.UUID(data["encounter_id"])
    uuid.UUID(data["patient_id"])


def test_direct_registration_without_otp_rejected():
    """POST /session without OTP must be rejected with 400."""
    payload = {
        "full_name": "Unverified User",
        "age": 30,
        "phone": "+919876543210",
    }
    r = client.post("/session", json=payload)
    assert r.status_code == 400
    assert "OTP verification code is required" in str(r.json())


def test_direct_registration_without_phone_rejected():
    """POST /session without phone must be rejected with 400."""
    payload = {
        "full_name": "No Phone User",
        "age": 30,
        "otp": "123456",
    }
    r = client.post("/session", json=payload)
    assert r.status_code == 400
    assert "Mobile phone number is mandatory" in str(r.json())


def test_direct_registration_with_invalid_otp_rejected():
    """POST /session with invalid OTP must be rejected with 401."""
    payload = {
        "full_name": "Wrong OTP User",
        "age": 30,
        "phone": "+919876543210",
        "otp": "000000",
    }
    r = client.post("/session", json=payload)
    assert r.status_code == 401
    assert "OTP" in str(r.json())


def test_record_consent_success():
    """POST /consent records patient consent for an encounter."""
    # 1. Start session with OTP
    r1 = client.post(
        "/session",
        json={"full_name": "Suresh Patel", "age": 55, "phone": "9876543210", "otp": "123456"},
    )
    assert r1.status_code == 201
    enc_id = r1.json()["encounter_id"]

    # 2. Record consent
    c_payload = {
        "encounter_id": enc_id,
        "consented": True,
        "consent_version": "v1.0",
    }
    r2 = client.post("/consent", json=c_payload)
    assert r2.status_code == 200
    c_data = r2.json()
    assert c_data["encounter_id"] == enc_id
    assert c_data["consented"] is True
    assert c_data["status"] == "consented"

    # 3. Verify GET /session/{id} shows consented: True
    r3 = client.get(f"/session/{enc_id}")
    assert r3.status_code == 200
    s_data = r3.json()
    assert s_data["consented"] is True
    assert s_data["patient"]["full_name"] == "Suresh Patel"


def test_record_consent_declined():
    """POST /consent with consented=False cancels the encounter."""
    r1 = client.post(
        "/session",
        json={"full_name": "Declined User", "age": 40, "phone": "9876543210", "otp": "123456"},
    )
    enc_id = r1.json()["encounter_id"]

    c_payload = {
        "encounter_id": enc_id,
        "consented": False,
        "consent_version": "v1.0",
    }
    r2 = client.post("/consent", json=c_payload)
    assert r2.status_code == 200
    assert r2.json()["status"] == "declined"

    # Verify encounter status is cancelled
    r3 = client.get(f"/session/{enc_id}")
    assert r3.status_code == 200
    assert r3.json()["status"] == "cancelled"


def test_get_session_invalid_uuid():
    """GET /session/invalid-uuid returns 400."""
    r = client.get("/session/not-a-uuid")
    assert r.status_code == 400
    assert "Invalid encounter_id format" in r.json()["message"]


def test_get_session_not_found():
    """GET /session/{random_uuid} returns 404."""
    random_id = str(uuid.uuid4())
    r = client.get(f"/session/{random_id}")
    assert r.status_code == 404
    assert "Encounter not found" in r.json()["message"]
