"""
Arogya Link — services/escalation_service.py
=============================================
Phase 7 — Real-Time Emergency Escalation Service.
"""

from __future__ import annotations

from typing import Any
from app.api.v1.ws_notifications import manager as ws_manager
from app.services.n8n_service import n8n_service


class EscalationService:
    """Dispatches emergency notifications when red-flag thresholds are met."""

    async def trigger_escalation(
        self, encounter_id: str, triage_level: str, red_flags: list[dict[str, Any]]
    ) -> dict[str, Any]:
        alert_payload = {
            "type": "EMERGENCY_ALERT" if triage_level == "CRITICAL" else "TRIAGE_UPDATE",
            "encounter_id": encounter_id,
            "triage_level": triage_level,
            "red_flags_count": len(red_flags),
            "red_flags": red_flags,
            "message": f"Critical Triage Alert for Encounter {encounter_id[:8]}" if triage_level == "CRITICAL" else "Patient intake updated",
        }

        # Broadcast via WebSocket to Doctor Dashboard
        await ws_manager.broadcast(alert_payload)

        # Trigger external n8n cloud automation webhook
        try:
            await n8n_service.send_emergency_escalation(
                encounter_id=encounter_id,
                triage_level=triage_level,
                red_flags=red_flags,
            )
        except Exception:
            pass

        return alert_payload
