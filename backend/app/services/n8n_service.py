"""
Arogya Link — services/n8n_service.py
======================================
n8n Cloud Automation & Webhook Notification Integration Service.

Dispatches real-time clinical and operational events to the n8n webhook:
https://shrinvas2005.app.n8n.cloud/webhook/arogyasetu-notifications

Supported Event Categories:
  - EMERGENCY_ESCALATION: Critical triage, red flags, vitals alert
  - PATIENT_CHECKIN: New patient intake at kiosk or ABHA login
  - MEDICATION_REMINDER: Patient prescription & dosage schedule alert
  - TEST_PING: Webhook verification and diagnostic test
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)


class N8nNotificationService:
    """Dispatches asynchronous event notifications to the n8n workflow webhook."""

    def __init__(self) -> None:
        self._delivery_logs: list[dict[str, Any]] = []

    @property
    def webhook_url(self) -> str:
        return settings.n8n_webhook_url or "https://shrinvas2005.app.n8n.cloud/webhook/arogyasetu-notifications"

    @property
    def is_enabled(self) -> bool:
        return bool(settings.n8n_enabled and self.webhook_url)

    async def dispatch_event(
        self,
        event_type: str,
        data: dict[str, Any],
        priority: str = "NORMAL",
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Asynchronously deliver structured event payload to the n8n webhook.
        Designed to be non-blocking and safe: failures are caught, logged,
        and returned with diagnostics without failing the parent transaction.
        """
        dispatch_id = str(uuid.uuid4())
        now_iso = datetime.now(timezone.utc).isoformat()

        payload = {
            "dispatch_id": dispatch_id,
            "event": event_type,
            "timestamp": now_iso,
            "source": "ArogyaSetu / ArogyaLink",
            "priority": priority,
            "data": data,
            "meta": {
                "app_version": settings.app_version,
                "environment": settings.app_env,
                **(metadata or {}),
            },
        }

        if not self.is_enabled:
            log_entry = {
                "dispatch_id": dispatch_id,
                "event": event_type,
                "timestamp": now_iso,
                "status": "SKIPPED",
                "reason": "n8n notifications are disabled or webhook URL is not set.",
                "webhook_url": self.webhook_url,
                "payload": payload,
            }
            self._record_log(log_entry)
            return log_entry

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(
                    self.webhook_url,
                    json=payload,
                    headers={
                        "Content-Type": "application/json",
                        "X-Arogya-Source": "ArogyaSetu-Cloud",
                        "X-Event-Type": event_type,
                    },
                )
                success = response.is_success
                try:
                    import inspect
                    res_val = response.json()
                    if inspect.isawaitable(res_val):
                        response_body = await res_val
                    else:
                        response_body = res_val
                except Exception:
                    response_body = {"text": str(getattr(response, "text", ""))}

                log_entry = {
                    "dispatch_id": dispatch_id,
                    "event": event_type,
                    "timestamp": now_iso,
                    "status": "DELIVERED" if success else "FAILED",
                    "status_code": response.status_code,
                    "webhook_url": self.webhook_url,
                    "response": response_body,
                    "payload": payload,
                }
                self._record_log(log_entry)
                return log_entry

        except Exception as exc:
            logger.warning("Failed to dispatch n8n notification (%s): %s", event_type, exc)
            log_entry = {
                "dispatch_id": dispatch_id,
                "event": event_type,
                "timestamp": now_iso,
                "status": "ERROR",
                "error": str(exc),
                "webhook_url": self.webhook_url,
                "payload": payload,
            }
            self._record_log(log_entry)
            return log_entry

    async def send_emergency_escalation(
        self,
        encounter_id: str,
        triage_level: str,
        red_flags: list[dict[str, Any]],
        patient_info: dict[str, Any] | None = None,
        notes: str | None = None,
    ) -> dict[str, Any]:
        """Dispatch real-time emergency clinical escalation alert to n8n."""
        data = {
            "encounter_id": encounter_id,
            "triage_level": triage_level,
            "red_flags_count": len(red_flags),
            "red_flags": red_flags,
            "patient": patient_info or {},
            "urgency": "IMMEDIATE" if triage_level == "CRITICAL" else "ELEVATED",
            "message": f"🚨 Critical Clinical Alert: Encounter {encounter_id[:8]} requires immediate doctor attention.",
            "notes": notes or "Red flags triggered during patient clinical intake.",
        }
        return await self.dispatch_event(
            event_type="EMERGENCY_ESCALATION",
            data=data,
            priority="CRITICAL" if triage_level == "CRITICAL" else "HIGH",
        )

    async def send_patient_checkin(
        self,
        encounter_id: str,
        patient_name: str,
        triage_level: str = "ROUTINE",
        abha_number: str | None = None,
        kiosk_id: str | None = "kiosk-01",
        time: str | None = None,
    ) -> dict[str, Any]:
        """Dispatch patient arrival / check-in event to n8n."""
        data = {
            "encounter_id": encounter_id,
            "patient_name": patient_name,
            "triage_level": triage_level,
            "abha_number": abha_number,
            "kiosk_id": kiosk_id,
            "checkin_time": time or datetime.now(timezone.utc).isoformat(),
            "message": f"Patient '{patient_name}' checked in at {kiosk_id}.",
        }
        return await self.dispatch_event(
            event_type="PATIENT_CHECKIN",
            data=data,
            priority="NORMAL",
        )

    async def send_medication_reminder(
        self,
        reminder: dict[str, Any],
    ) -> dict[str, Any]:
        """Dispatch medication / follow-up schedule notification to n8n."""
        data = {
            "reminder_id": reminder.get("reminder_id"),
            "encounter_id": reminder.get("encounter_id"),
            "patient_name": reminder.get("patient_name"),
            "phone": reminder.get("phone"),
            "medication_name": reminder.get("medication_name"),
            "dosage": reminder.get("dosage"),
            "schedule_time": reminder.get("schedule_time"),
            "instructions": reminder.get("instructions"),
            "wa_link": reminder.get("wa_link"),
            "channel": reminder.get("channel", "WhatsApp"),
            "message_text": reminder.get("message_text"),
        }
        return await self.dispatch_event(
            event_type="MEDICATION_REMINDER",
            data=data,
            priority="NORMAL",
        )

    async def send_test_alert(
        self,
        triggered_by: str = "Doctor Dashboard",
        note: str = "Diagnostic health check from ArogyaSetu UI",
    ) -> dict[str, Any]:
        """Send diagnostic test ping to verify n8n webhook workflow."""
        data = {
            "test": True,
            "triggered_by": triggered_by,
            "note": note,
            "message": "ArogyaSetu n8n webhook notification integration is active and operating normally.",
        }
        return await self.dispatch_event(
            event_type="TEST_PING",
            data=data,
            priority="NORMAL",
        )

    def _record_log(self, entry: dict[str, Any]) -> None:
        self._delivery_logs.append(entry)
        if len(self._delivery_logs) > 50:
            self._delivery_logs.pop(0)

    def get_delivery_logs(self) -> list[dict[str, Any]]:
        return list(reversed(self._delivery_logs))

    def get_status(self) -> dict[str, Any]:
        return {
            "enabled": self.is_enabled,
            "webhook_url": self.webhook_url,
            "total_dispatches": len(self._delivery_logs),
            "last_dispatch": self._delivery_logs[-1] if self._delivery_logs else None,
        }


# Singleton instance
n8n_service = N8nNotificationService()
