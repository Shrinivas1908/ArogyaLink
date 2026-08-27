"""
Arogya Link — tests/test_audit_approval.py
============================================
Phase 11 — Doctor Approval & Audit Trail Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.core.deps import AuthUser, get_current_user
from app.main import create_app
from app.services.audit_service import AuditService

app = create_app()
client = TestClient(app)
audit_service = AuditService()

mock_doctor = AuthUser(
    id="doc-audit-1",
    sub="sub-doc-audit",
    role="doctor",
    email="doctor_audit@arogyalink.in",
    full_name="Dr. Audit Reviewer",
)

app.dependency_overrides[get_current_user] = lambda: mock_doctor


def test_audit_service_recording():
    """Verify AuditService records approval and override logs."""
    rec = audit_service.record_doctor_action(
        encounter_id="enc-audit-1",
        doctor_id="doc-123",
        action_type="APPROVED",
    )
    assert rec["action_type"] == "APPROVED"
    assert len(audit_service.get_encounter_audit_trail("enc-audit-1")) == 1


def test_audit_api_approve_and_override():
    """Verify POST /audit/approve-summary and POST /audit/override-summary."""
    # 1. Create session & consent
    r1 = client.post("/session", json={"full_name": "Audit Test Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    # 2. Approve summary
    r_app = client.post("/audit/approve-summary", json={"encounter_id": enc_id})
    assert r_app.status_code == 200
    assert r_app.json()["audit_record"]["action_type"] == "APPROVED"

    # 3. Override summary
    r_over = client.post(
        "/audit/override-summary",
        json={
            "encounter_id": enc_id,
            "edited_summary": {"chief_complaint": "Overridden complaint"},
            "override_reason": "Corrected initial intake complaint",
        },
    )
    assert r_over.status_code == 200
    assert r_over.json()["audit_record"]["action_type"] == "OVERRIDDEN"

    # 4. GET /audit/encounter/{id}
    r_trail = client.get(f"/audit/encounter/{enc_id}")
    assert r_trail.status_code == 200
    assert len(r_trail.json()["logs"]) >= 2
