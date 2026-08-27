"""
Arogya Link — tests/test_question_engine.py
=============================================
Unit & Integration tests for QuestionEngine and /intake API endpoints.

Per Phase 4 plan (Person 3):
  - QuestionEngine deterministic branching logic test.
  - Intake completion sentinel evaluation.
  - Answer persistence to PostgreSQL answers table.
  - GET /intake/next-question & POST /intake/answer API enforcement.
"""

from __future__ import annotations

import uuid
import pytest
from fastapi.testclient import TestClient

from app.engines.question_engine import QuestionEngine
from app.main import create_app

app = create_app()
client = TestClient(app)
engine = QuestionEngine()


def test_question_engine_init_and_get_question():
    """Verify question bank loads and get_question returns valid definitions."""
    q = engine.get_question("q_chief_complaint")
    assert q is not None
    assert q["id"] == "q_chief_complaint"
    assert q["type"] == "multi_select"
    assert len(q["options"]) > 0


def test_question_engine_next_question_branching():
    """Verify deterministic next_question branching logic."""
    answers = {}
    
    # 1. First question must be q_chief_complaint
    q1 = engine.next_question("enc-1", answers)
    assert q1 is not None
    assert q1["id"] == "q_chief_complaint"

    # 2. Answer q_chief_complaint -> next is q_duration
    answers["q_chief_complaint"] = ["chest_pain"]
    q2 = engine.next_question("enc-1", answers)
    assert q2 is not None
    assert q2["id"] == "q_duration"

    # 3. Answer q_duration -> next is q_severity
    answers["q_duration"] = "today"
    q3 = engine.next_question("enc-1", answers)
    assert q3 is not None
    assert q3["id"] == "q_severity"

    # 4. Branch test: q_medications = 'no' -> skips q_medication_details -> goes to q_allergies
    answers["q_severity"] = "severe"
    answers["q_associated_symptoms"] = ["sweating"]
    answers["q_medical_history"] = ["none"]
    answers["q_medications"] = "no"

    q_next = engine.next_question("enc-1", answers)
    assert q_next is not None
    assert q_next["id"] == "q_allergies"

    # 5. Answer q_allergies -> intake is complete
    answers["q_allergies"] = "no"
    assert engine.is_complete(answers) is True
    assert engine.next_question("enc-1", answers) is None


def test_intake_api_unconsented_encounter():
    """GET /intake/next-question without patient consent returns 403."""
    # 1. Start session without recording consent
    r1 = client.post("/session", json={"full_name": "No Consent User"})
    assert r1.status_code == 201
    enc_id = r1.json()["encounter_id"]

    # 2. Attempt next question -> must fail 403
    r2 = client.get(f"/intake/next-question?encounter_id={enc_id}")
    assert r2.status_code == 403
    assert "active patient consent" in r2.json()["message"]


def test_intake_api_full_flow():
    """Complete adaptive intake flow via /intake/answer APIs."""
    # 1. Start session & record consent
    r1 = client.post("/session", json={"full_name": "Ananya Sen", "age": 29})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    # 2. GET /intake/next-question
    r2 = client.get(f"/intake/next-question?encounter_id={enc_id}")
    assert r2.status_code == 200
    assert r2.json()["question"]["id"] == "q_chief_complaint"

    # 3. POST /intake/answer for q_chief_complaint
    r3 = client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_chief_complaint",
        "answer_value": ["fever", "headache"]
    })
    assert r3.status_code == 200
    assert r3.json()["recorded"] is True
    assert r3.json()["next_question"]["id"] == "q_duration"

    # 4. POST /intake/answer for q_duration
    r4 = client.post("/intake/answer", json={
        "encounter_id": enc_id,
        "question_id": "q_duration",
        "answer_value": "2_3_days"
    })
    assert r4.status_code == 200
    assert r4.json()["next_question"]["id"] == "q_severity"

    # 5. GET /intake/answers/{encounter_id}
    r5 = client.get(f"/intake/answers/{enc_id}")
    assert r5.status_code == 200
    ans_data = r5.json()
    assert ans_data["answers_count"] == 2
    assert ans_data["answers"]["q_chief_complaint"] == ["fever", "headache"]
