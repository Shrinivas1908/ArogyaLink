"""
Arogya Link — ReminderService (stub)
======================================
Phase: 17 — Reminder System

Responsibility
--------------
Schedules medicine and follow-up reminders for patients after a doctor has
approved a clinical summary.  Delivers reminders via SMS, WhatsApp, or push
notification through a configurable gateway.

Dependency order: implement AFTER Phase 10 (approved summaries) and Phase 3
(encounter/follow-up data) are complete.

Implementation target: Phase 17
"""

from __future__ import annotations

from typing import Any

__all__ = ["ReminderService"]


class ReminderService:
    """Schedules and delivers patient reminders.

    All public methods raise :class:`NotImplementedError` until Phase 17.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 17
    # ------------------------------------------------------------------

    async def schedule_reminder(
        self,
        encounter_id: str,
        reminder_type: str,
        deliver_at: str,
        channel: str = "sms",
        payload: dict[str, Any] | None = None,
    ) -> str:
        """Schedule a reminder and return a ``reminder_id``.

        Parameters
        ----------
        reminder_type:  e.g. ``"medicine"``, ``"follow_up"``.
        deliver_at:     ISO-8601 datetime string (UTC).
        channel:        ``"sms"`` | ``"whatsapp"`` | ``"push"``.

        :raises NotImplementedError: until Phase 17 is implemented.
        """
        raise NotImplementedError("ReminderService.schedule_reminder — implement in Phase 17")

    async def cancel_reminder(self, reminder_id: str) -> None:
        """Cancel a previously scheduled reminder.

        :raises NotImplementedError: until Phase 17 is implemented.
        """
        raise NotImplementedError("ReminderService.cancel_reminder — implement in Phase 17")
