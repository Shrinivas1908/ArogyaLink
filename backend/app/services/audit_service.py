"""
Arogya Link — services/audit_service.py
========================================
Phase 11 — Doctor Approval, Override & Audit Logging Service.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any


class AuditService:
    """Records immutable clinical decision logs when doctors approve or override intake summaries."""

    def __init__(self) -> None:
        self._audit_logs: list[dict[str, Any]] = []

    def record_doctor_action(
        self,
        encounter_id: str,
        doctor_id: str,
        action_type: str,
        edited_summary: dict[str, Any] | None = None,
        override_reason: str | None = None,
    ) -> dict[str, Any]:
        """Record doctor approval or override audit entry."""
        log_entry = {
            "audit_id": str(uuid.uuid4()),
            "encounter_id": encounter_id,
            "doctor_id": doctor_id,
            "action_type": action_type,  # "APPROVED" | "OVERRIDDEN"
            "edited_summary": edited_summary,
            "override_reason": override_reason,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
        self._audit_logs.append(log_entry)
        return log_entry

    def get_encounter_audit_trail(self, encounter_id: str) -> list[dict[str, Any]]:
        return [log for log in self._audit_logs if log["encounter_id"] == encounter_id]
