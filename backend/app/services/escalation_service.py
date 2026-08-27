"""
Arogya Link — EscalationService (stub)
========================================
Phase: 7 — Real-Time Escalation

Responsibility
--------------
When RedFlagEngine produces a critical or high-severity result, this service:
  1. Persists an escalation record in the ``escalations`` table.
  2. Broadcasts the escalation payload to connected doctor clients over
     the FastAPI WebSocket channel ``/ws/staff-alerts``.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Escalation records must be PERSISTED before the broadcast — a broadcast
  without a persisted record is not acceptable.
* Escalation acknowledgement by the doctor must be audit-logged.
* The escalation severity comes from RedFlagEngine; it must NOT be
  modified by this service.

Implementation target: Phase 7
"""

from __future__ import annotations

from typing import Any

__all__ = ["EscalationService"]


class EscalationService:
    """Persists escalations and broadcasts live alerts over WebSocket.

    All public methods raise :class:`NotImplementedError` until Phase 7.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 7
    # ------------------------------------------------------------------

    async def create_escalation(
        self, encounter_id: str, flags: list[dict[str, Any]]
    ) -> str:
        """Persist escalation records for *flags* and return ``escalation_id``.

        :raises NotImplementedError: until Phase 7 is implemented.
        """
        raise NotImplementedError("EscalationService.create_escalation — implement in Phase 7")

    async def broadcast(self, escalation_id: str, payload: dict[str, Any]) -> None:
        """Broadcast *payload* to all connected staff WebSocket clients.

        :raises NotImplementedError: until Phase 7 is implemented.
        """
        raise NotImplementedError("EscalationService.broadcast — implement in Phase 7")

    async def acknowledge(self, escalation_id: str, staff_id: str) -> None:
        """Record a doctor acknowledgement for *escalation_id*.

        Must call AuditService to log the acknowledgement action.

        :raises NotImplementedError: until Phase 7 is implemented.
        """
        raise NotImplementedError("EscalationService.acknowledge — implement in Phase 7")
