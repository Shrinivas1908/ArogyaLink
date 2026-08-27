"""
Arogya Link — tests/test_fhir_abdm.py
======================================
Phase 12 — FHIR R4 Bundle & ABDM Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.fhir_service import FHIRService

app = create_app()
client = TestClient(app)
fhir_service = FHIRService()


def test_fhir_service_bundle_builder():
    """Verify FHIRService creates valid HL7 FHIR R4 Bundle structure."""
    bundle = fhir_service.build_encounter_fhir_bundle("enc-fhir-1", "Aarav Sharma", {"q_chief_complaint": "chest_pain"})
    assert bundle["resourceType"] == "Bundle"
    assert bundle["type"] == "document"
    assert len(bundle["entry"]) >= 3


def test_fhir_and_abdm_apis():
    """Verify GET /fhir/encounter/{id} and POST /fhir/link-abha."""
    # 1. Create session & consent
    r1 = client.post("/session", json={"full_name": "ABDM Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})
    client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_chief_complaint",
        "answer_value": ["fever"]
    })

    # 2. GET /fhir/encounter/{id}
    r_fhir = client.get(f"/fhir/encounter/{enc_id}")
    assert r_fhir.status_code == 200
    assert r_fhir.json()["resourceType"] == "Bundle"

    # 3. POST /fhir/link-abha
    r_link = client.post("/fhir/link-abha", json={
        "encounter_id": enc_id,
        "abha_number": "91-4820-9182-3491"
    })
    assert r_link.status_code == 200
    assert r_link.json()["status"] == "success"
    assert r_link.json()["abdm_result"]["verification"]["status"] == "VERIFIED"
