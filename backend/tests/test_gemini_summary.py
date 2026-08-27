"""
Arogya Link — tests/test_gemini_summary.py
============================================
Phase 10 — Gemini Clinical Summary & Contradiction Detection Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.engines.contradiction_engine import ContradictionEngine
from app.integrations.gemini_client import GeminiClient
from app.main import create_app

app = create_app()
client = TestClient(app)


def test_gemini_client_summary_generation():
    """Verify GeminiClient output matches structured Pydantic schema."""
    g_client = GeminiClient()
    answers = {"q_chief_complaint": ["chest_pain"], "q_duration": "today", "q_severity": "severe"}
    res = g_client.generate_clinical_summary(answers)
    assert "chief_complaint" in res
    assert "key_findings" in res
    assert "suggested_doctor_actions" in res


def test_contradiction_engine_detection():
    """Verify ContradictionEngine flags patient answer vs OCR text discrepancies."""
    c_engine = ContradictionEngine()
    answers = {"q_medications": "no"}
    ocr_text = "Rx: Tab Paracetamol 500mg"
    contradictions = c_engine.check_contradictions(answers, ocr_text=ocr_text)
    assert len(contradictions) == 1
    assert contradictions[0]["type"] == "MEDICATION_DISCREPANCY"


def test_summary_api_endpoints():
    """Verify POST /summary/generate and GET /summary/encounter/{id}."""
    r1 = client.post("/session", json={"full_name": "Summary Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})
    client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_chief_complaint",
        "answer_value": ["fever"]
    })

    r_gen = client.post("/summary/generate", json={"encounter_id": enc_id})
    assert r_gen.status_code == 200
    res = r_gen.json()
    assert res["encounter_id"] == enc_id
    assert "summary" in res

    r_get = client.get(f"/summary/encounter/{enc_id}")
    assert r_get.status_code == 200
    assert r_get.json()["encounter_id"] == enc_id
