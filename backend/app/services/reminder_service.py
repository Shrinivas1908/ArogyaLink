"""
Arogya Link — services/reminder_service.py
===========================================
Phase 14 — Automated Medication & Follow-up Reminder Service.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any


class ReminderService:
    """Manages scheduled medication reminders via WhatsApp / SMS."""

    def __init__(self) -> None:
        self._reminders: list[dict[str, Any]] = []

    def create_reminder(
        self,
        encounter_id: str,
        medication_name: str,
        dosage: str,
        schedule_time: str,
        phone: str | None = None,
    ) -> dict[str, Any]:
        reminder = {
            "reminder_id": str(uuid.uuid4()),
            "encounter_id": encounter_id,
            "medication_name": medication_name,
            "dosage": dosage,
            "schedule_time": schedule_time,
            "phone": phone or "+91 98765 43210",
            "status": "SCHEDULED",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        self._reminders.append(reminder)
        return reminder

    def get_encounter_reminders(self, encounter_id: str) -> list[dict[str, Any]]:
        return [r for r in self._reminders if r["encounter_id"] == encounter_id]
