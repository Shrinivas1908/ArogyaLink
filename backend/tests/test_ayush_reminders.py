"""
Arogya Link — tests/test_ayush_reminders.py
============================================
Phase 14 — AYUSH Module & Reminders Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.ayush_service import AyushService
from app.services.reminder_service import ReminderService

app = create_app()
client = TestClient(app)
ayush_service = AyushService()
reminder_service = ReminderService()


def test_ayush_service():
    """Verify AyushService Prakriti evaluation."""
    res = ayush_service.evaluate_prakriti({})
    assert res["status"] == "success"
    assert "prakriti" in res


def test_reminder_service():
    """Verify ReminderService creation and retrieval."""
    rem = reminder_service.create_reminder("enc-rem-1", "Paracetamol", "500mg", "09:00 AM")
    assert rem["medication_name"] == "Paracetamol"
    assert len(reminder_service.get_encounter_reminders("enc-rem-1")) == 1


def test_ayush_and_reminders_apis():
    """Verify POST /ayush/assess and POST /reminders/create APIs."""
    # 1. Create session & consent
    r1 = client.post("/session", json={"full_name": "AYUSH Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    # 2. AYUSH Assess API
    r_ayush = client.post("/ayush/assess", json={"encounter_id": enc_id, "responses": {}})
    assert r_ayush.status_code == 200
    assert r_ayush.json()["status"] == "success"

    # 3. Create Reminder API
    r_rem = client.post("/reminders/create", json={
        "encounter_id": enc_id,
        "medication_name": "Paracetamol 500mg",
        "dosage": "1 tab after meals",
        "schedule_time": "08:00 AM"
    })
    assert r_rem.status_code == 200
    assert r_rem.json()["status"] == "success"

    # 4. Get Reminders API
    r_get_rem = client.get(f"/reminders/encounter/{enc_id}")
    assert r_get_rem.status_code == 200
    assert len(r_get_rem.json()["reminders"]) >= 1
