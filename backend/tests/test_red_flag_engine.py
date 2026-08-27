"""
Arogya Link — tests/test_red_flag_engine.py
=============================================
Unit & Integration tests for RedFlagEngine and /triage API endpoints.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.engines.red_flag_engine import RedFlagEngine
from app.main import create_app

app = create_app()
client = TestClient(app)
engine = RedFlagEngine()


def test_red_flag_engine_routine_symptoms():
    """Verify routine symptoms evaluate to ROUTINE triage level."""
    answers = {
        "q_chief_complaint": ["fever"],
        "q_associated_symptoms": ["cough"]
    }
    res = engine.evaluate_answers(answers)
    assert res["triage_level"] == "ROUTINE"
    assert res["has_red_flags"] is False


def test_red_flag_engine_chest_pain_sweating_critical():
    """Verify chest pain with sweating triggers RED_FLAG_CRITICAL."""
    answers = {
        "q_chief_complaint": ["chest_pain"],
        "q_associated_symptoms": ["sweating"]
    }
    res = engine.evaluate_answers(answers)
    assert res["triage_level"] == "CRITICAL"
    assert res["has_red_flags"] is True
    assert res["requires_immediate_escalation"] is True
    assert len(res["triggered_flags"]) >= 1


def test_triage_api_flow():
    """Verify POST /triage/evaluate updates encounter triage status."""
    # 1. Create session & consent
    r1 = client.post("/session", json={"full_name": "Emergency Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    # 2. Submit critical symptoms answer
    client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_chief_complaint",
        "answer_value": ["chest_pain"]
    })
    client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_associated_symptoms",
        "answer_value": ["sweating"]
    })

    # 3. Evaluate triage
    r_triage = client.post("/triage/evaluate", json={"encounter_id": enc_id})
    assert r_triage.status_code == 200
    data = r_triage.json()
    assert data["triage_level"] == "CRITICAL"
    assert data["requires_immediate_escalation"] is True

    # 4. Check GET /triage/status
    r_status = client.get(f"/triage/status/{enc_id}")
    assert r_status.status_code == 200
    assert r_status.json()["triage_level"] == "CRITICAL"
