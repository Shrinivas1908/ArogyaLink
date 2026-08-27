"""
Arogya Link — api/v1/reminders.py
=================================
Phase 14 — Medication & Follow-up Reminders APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.services.reminder_service import ReminderService

router = APIRouter(prefix="/reminders", tags=["reminders"])
reminder_service = ReminderService()


class CreateReminderRequest(BaseModel):
    encounter_id: str
    medication_name: str
    dosage: str
    schedule_time: str
    phone: str | None = None


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
    )
    return {"status": "success", "reminder": reminder}


@router.get("/encounter/{encounter_id}")
async def get_reminders(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve active reminders for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    reminders = reminder_service.get_encounter_reminders(encounter_id)
    return {"encounter_id": encounter_id, "reminders": reminders}
