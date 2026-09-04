"""
Arogya Link — tests/test_ayush_reminders.py
============================================
Phase 14 — AYUSH Module & Real WhatsApp Reminders Integration Tests.
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


def test_reminder_service_whatsapp_formatting():
    """Verify ReminderService WhatsApp message generation and wa.me deep links."""
    msg_en = reminder_service.format_whatsapp_message(
        patient_name="Ananya Sharma",
        medication_name="Tab. Aspirin 75mg",
        dosage="1 tablet once daily",
        schedule_time="08:30 AM",
        instructions="Take after breakfast with water",
        doctor_name="Dr. Rohit Verma",
        language="en",
    )
    assert "ArogyaLink Health Care Reminder" in msg_en
    assert "Ananya Sharma" in msg_en
    assert "Tab. Aspirin 75mg" in msg_en

    # Verify Hindi message
    msg_hi = reminder_service.format_whatsapp_message(
        patient_name="अनन्या शर्मा",
        medication_name="पैरासिटामोल 650mg",
        dosage="दिन में दो बार",
        schedule_time="सुबह 09:00",
        language="hi",
    )
    assert "आरोग्य लिंक" in msg_hi
    assert "अनन्या शर्मा" in msg_hi

    # Verify wa.me link generation
    wa_link = reminder_service.generate_wa_link("+91 98765 43210", msg_en)
    assert wa_link.startswith("https://wa.me/919876543210?text=")


def test_reminder_creation_and_retrieval():
    """Verify ReminderService reminder creation with WhatsApp payload."""
    rem = reminder_service.create_reminder(
        encounter_id="enc-rem-1",
        medication_name="Paracetamol",
        dosage="500mg",
        schedule_time="09:00 AM",
        patient_name="Ramesh Kumar",
        phone="+91 98765 12345",
    )
    assert rem["medication_name"] == "Paracetamol"
    assert rem["channel"] == "WhatsApp"
    assert "wa_link" in rem
    assert "message_text" in rem
    assert len(reminder_service.get_encounter_reminders("enc-rem-1")) >= 1


def test_ayush_and_reminders_apis():
    """Verify POST /ayush/assess, POST /reminders/create, and POST /reminders/send-whatsapp APIs."""
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
        "schedule_time": "08:00 AM",
        "patient_name": "AYUSH Patient",
        "phone": "+91 98765 43210",
        "language": "en",
    })
    assert r_rem.status_code == 200
    assert r_rem.json()["status"] == "success"
    assert "wa_link" in r_rem.json()["reminder"]

    # 4. Get Reminders API
    r_get_rem = client.get(f"/reminders/encounter/{enc_id}")
    assert r_get_rem.status_code == 200
    assert len(r_get_rem.json()["reminders"]) >= 1

    # 5. Send Real WhatsApp API
    r_send_wa = client.post("/reminders/send-whatsapp", json={
        "phone": "+91 98765 43210",
        "medication_name": "Tab. Atorvastatin 20mg",
        "dosage": "1 tab at bedtime",
        "schedule_time": "10:00 PM",
        "patient_name": "AYUSH Patient",
        "language": "en",
    })
    assert r_send_wa.status_code == 200
    assert r_send_wa.json()["status"] == "success"
    assert "wa_link" in r_send_wa.json()
    assert "message_text" in r_send_wa.json()

    # 6. Preview WhatsApp API
    r_preview = client.post("/reminders/preview", json={
        "medication_name": "Tab. Aspirin 75mg",
        "dosage": "1 tab daily",
        "schedule_time": "08:00 AM",
        "patient_name": "AYUSH Patient",
        "language": "hi",
    })
    assert r_preview.status_code == 200
    assert "आरोग्य लिंक" in r_preview.json()["message_text"]

    # 7. Delivery Logs API
    r_logs = client.get("/reminders/delivery-logs")
    assert r_logs.status_code == 200
    assert isinstance(r_logs.json()["logs"], list)
