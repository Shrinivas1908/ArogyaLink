"""
Arogya Link — AuditService (stub)
====================================
Phase: 12 — Audit Logging

Responsibility
--------------
Provides a single ``log_action`` helper that appends an immutable record to
the ``audit_log`` table for every sensitive action performed by authenticated
staff.

Actions that MUST be audit-logged (from Rules.md / Architecture.md):
  * Doctor summary approval
  * Doctor summary edit
  * Escalation acknowledgement
  * Role or permission change (admin action)
  * OCR result verification

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* The audit log must be APPEND-ONLY — no update or delete operations.
* Every log entry must reference an authenticated staff identity.
* Audit logging must not be bypassable by any other service.

Implementation target: Phase 12
"""

from __future__ import annotations

from typing import Any

__all__ = ["AuditService"]


class AuditService:
    """Appends immutable audit records for sensitive staff actions.

    All public methods raise :class:`NotImplementedError` until Phase 12.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 12
    # ------------------------------------------------------------------

    async def log_action(
        self,
        staff_id: str,
        action: str,
        resource_type: str,
        resource_id: str,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Append an audit record.

        Parameters
        ----------
        staff_id:       Authenticated staff user ID (from Supabase Auth).
        action:         Short action label, e.g. ``"summary_approved"``.
        resource_type:  e.g. ``"encounter"``, ``"escalation"``.
        resource_id:    ID of the resource being acted upon.
        metadata:       Optional extra context (never store secrets here).

        :raises NotImplementedError: until Phase 12 is implemented.
        """
        raise NotImplementedError("AuditService.log_action — implement in Phase 12")
