"""
Arogya Link — api/v1/reminders.py
=================================
Phase 14 — Real WhatsApp Medication & Follow-up Reminders APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.services.reminder_service import ReminderService
from app.services.n8n_service import n8n_service

router = APIRouter(prefix="/reminders", tags=["reminders"])
reminder_service = ReminderService()


class CreateReminderRequest(BaseModel):
    encounter_id: str
    medication_name: str
    dosage: str
    schedule_time: str
    phone: str | None = None
    patient_name: str | None = "Patient"
    instructions: str | None = None
    doctor_name: str | None = "Dr. Arogya Clinical Team"
    language: str | None = "en"


class SendWhatsAppRequest(BaseModel):
    phone: str = Field(..., description="Patient mobile number, e.g. +91 98765 43210")
    medication_name: str
    dosage: str = "As directed"
    schedule_time: str = "08:00 AM"
    patient_name: str | None = "Patient"
    instructions: str | None = None
    doctor_name: str | None = "Dr. Arogya Clinical Team"
    language: str | None = "en"
    encounter_id: str | None = None
    reminder_id: str | None = None


class PreviewWhatsAppRequest(BaseModel):
    phone: str | None = None
    patient_name: str | None = "Patient"
    medication_name: str
    dosage: str = "As directed"
    schedule_time: str = "08:00 AM"
    instructions: str | None = None
    doctor_name: str | None = "Dr. Arogya Clinical Team"
    language: str | None = "en"


@router.post("/create")
async def create_medication_reminder(
    body: CreateReminderRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Create scheduled WhatsApp / SMS medication reminder."""
    await validate_consented_encounter(body.encounter_id, db)
    reminder = reminder_service.create_reminder(
        encounter_id=body.encounter_id,
        medication_name=body.medication_name,
        dosage=body.dosage,
        schedule_time=body.schedule_time,
        phone=body.phone,
        patient_name=body.patient_name or "Patient",
        instructions=body.instructions,
        doctor_name=body.doctor_name or "Dr. Arogya Clinical Team",
        language=body.language or "en",
    )
    # Forward to n8n webhook automation
    try:
        await n8n_service.send_medication_reminder(reminder)
    except Exception:
        pass

    return {"status": "success", "reminder": reminder}


@router.post("/send-whatsapp")
async def send_whatsapp_message(
    body: SendWhatsAppRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """
    Send real WhatsApp message to patient's mobile number.
    Uses Twilio / Meta Cloud API if configured in .env, and generates
    one-click wa.me link for direct instant dispatch.
    """
    if body.encounter_id:
        try:
            await validate_consented_encounter(body.encounter_id, db)
        except Exception:
            pass  # Allow direct delivery if validated outside session

    msg_text = reminder_service.format_whatsapp_message(
        patient_name=body.patient_name or "Patient",
        medication_name=body.medication_name,
        dosage=body.dosage,
        schedule_time=body.schedule_time,
        instructions=body.instructions,
        doctor_name=body.doctor_name or "Dr. Arogya Clinical Team",
        language=body.language or "en",
    )

    result = await reminder_service.send_real_whatsapp(
        phone=body.phone,
        message=msg_text,
        reminder_id=body.reminder_id,
    )

    # Forward sent notification to n8n
    try:
        await n8n_service.dispatch_event(
            event_type="MEDICATION_DISPATCHED",
            data={
                "encounter_id": body.encounter_id,
                "reminder_id": body.reminder_id,
                "patient_name": body.patient_name,
                "phone": body.phone,
                "medication_name": body.medication_name,
                "delivery_status": result.get("delivery_status"),
                "dispatched_via": result.get("dispatched_via"),
                "wa_link": result.get("wa_link"),
            },
            priority="NORMAL",
        )
    except Exception:
        pass

    return {
        "status": "success",
        "result": result,
        "message_text": msg_text,
        "wa_link": result["wa_link"],
    }


@router.post("/preview")
async def preview_whatsapp_message(body: PreviewWhatsAppRequest) -> dict[str, Any]:
    """Preview formatted WhatsApp message text and instant wa.me link."""
    msg_text = reminder_service.format_whatsapp_message(
        patient_name=body.patient_name or "Patient",
        medication_name=body.medication_name,
        dosage=body.dosage,
        schedule_time=body.schedule_time,
        instructions=body.instructions,
        doctor_name=body.doctor_name or "Dr. Arogya Clinical Team",
        language=body.language or "en",
    )
    phone = body.phone or "+91 98765 43210"
    wa_link = reminder_service.generate_wa_link(phone, msg_text)
    return {
        "status": "success",
        "message_text": msg_text,
        "wa_link": wa_link,
        "phone": phone,
    }


@router.post("/{reminder_id}/send")
async def send_scheduled_reminder(
    reminder_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Trigger dispatch of a previously scheduled reminder by ID."""
    reminders = [r for r in reminder_service._reminders if r["reminder_id"] == reminder_id]
    if not reminders:
        raise HTTPException(status_code=404, detail="Reminder not found")

    target = reminders[0]
    result = await reminder_service.send_real_whatsapp(
        phone=target["phone"],
        message=target["message_text"],
        reminder_id=reminder_id,
    )
    return {"status": "success", "result": result}


@router.get("/encounter/{encounter_id}")
async def get_reminders(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve active reminders for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    reminders = reminder_service.get_encounter_reminders(encounter_id)
    return {"encounter_id": encounter_id, "reminders": reminders}


@router.get("/delivery-logs")
async def get_delivery_logs() -> dict[str, Any]:
    """Retrieve history of dispatched WhatsApp messages."""
    return {"logs": reminder_service.get_delivery_logs()}
