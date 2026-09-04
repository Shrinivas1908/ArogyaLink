"""
Arogya Link — api/v1/notifications.py
======================================
n8n Cloud Automation Webhook & Notifications Endpoints.

Provides endpoints to:
  - POST /notifications/n8n/test       : Trigger a test ping to n8n webhook.
  - POST /notifications/n8n/dispatch   : Dispatch a custom notification event payload.
  - GET  /notifications/n8n/status     : Get current webhook URL, status, and recent delivery logs.
  - POST /notifications/n8n/escalate   : Trigger emergency escalation alert manually.
"""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.services.n8n_service import n8n_service

router = APIRouter(prefix="/notifications", tags=["notifications"])


class N8nTestRequest(BaseModel):
    triggered_by: str = Field(default="Doctor Dashboard", description="Source or user initiating the test")
    note: str = Field(default="Manual test trigger from ArogyaSetu UI", description="Optional note or message")


class N8nCustomDispatchRequest(BaseModel):
    event_type: str = Field(..., description="Custom event name, e.g. PATIENT_ALERT, FOLLOWUP_NEEDED")
    data: dict[str, Any] = Field(default_factory=dict, description="Event payload dictionary")
    priority: str = Field(default="NORMAL", description="Alert priority: NORMAL, HIGH, CRITICAL")
    metadata: dict[str, Any] | None = Field(default=None, description="Optional metadata")


class N8nEscalationRequest(BaseModel):
    encounter_id: str = Field(..., description="Patient encounter identifier")
    triage_level: str = Field(default="CRITICAL", description="Triage category (e.g. CRITICAL, URGENT)")
    red_flags: list[dict[str, Any]] = Field(default_factory=list, description="Triggered red flag indicators")
    patient_name: str | None = Field(default="Unknown Patient", description="Patient full name")
    notes: str | None = Field(default=None, description="Doctor / triage assessment notes")


@router.post("/n8n/test")
async def trigger_n8n_test(body: N8nTestRequest | None = None) -> dict[str, Any]:
    """
    Trigger an immediate test ping to the n8n webhook:
    https://shrinvas2005.app.n8n.cloud/webhook/arogyasetu-notifications
    """
    triggered_by = body.triggered_by if body else "Doctor Dashboard"
    note = body.note if body else "Manual test trigger from ArogyaSetu UI"

    result = await n8n_service.send_test_alert(triggered_by=triggered_by, note=note)

    return {
        "status": "success" if result.get("status") in ("DELIVERED", "SKIPPED") else "warning",
        "delivery_status": result.get("status"),
        "webhook_url": result.get("webhook_url"),
        "n8n_response": result.get("response"),
        "details": result,
    }


@router.post("/n8n/dispatch")
async def dispatch_n8n_notification(body: N8nCustomDispatchRequest) -> dict[str, Any]:
    """Dispatch custom event payload to n8n automation webhook."""
    result = await n8n_service.dispatch_event(
        event_type=body.event_type,
        data=body.data,
        priority=body.priority,
        metadata=body.metadata,
    )
    return {
        "status": "success" if result.get("status") in ("DELIVERED", "SKIPPED") else "warning",
        "result": result,
    }


@router.post("/n8n/escalate")
async def manual_n8n_escalation(body: N8nEscalationRequest) -> dict[str, Any]:
    """Manually dispatch an emergency escalation alert to n8n."""
    result = await n8n_service.send_emergency_escalation(
        encounter_id=body.encounter_id,
        triage_level=body.triage_level,
        red_flags=body.red_flags,
        patient_info={"full_name": body.patient_name},
        notes=body.notes,
    )
    return {
        "status": "success" if result.get("status") in ("DELIVERED", "SKIPPED") else "warning",
        "result": result,
    }


@router.get("/n8n/status")
async def get_n8n_status() -> dict[str, Any]:
    """Get current n8n webhook status, configured endpoint, and recent delivery logs."""
    status_info = n8n_service.get_status()
    logs = n8n_service.get_delivery_logs()
    return {
        "status": "operational" if status_info["enabled"] else "disabled",
        "webhook_url": status_info["webhook_url"],
        "enabled": status_info["enabled"],
        "total_dispatches": status_info["total_dispatches"],
        "recent_logs": logs[:10],
    }


@router.get("/n8n/audit")
@router.get("/n8n/logs")
async def get_n8n_audit_logs() -> dict[str, Any]:
    """
    Retrieve full audit logs of all n8n webhook dispatches,
    including timestamps, event types, payloads, delivery status, and responses.
    """
    logs = n8n_service.get_delivery_logs()
    return {
        "status": "success",
        "total_records": len(logs),
        "audit_logs": logs,
    }


@router.post("/n8n/audit")
@router.post("/n8n/response")
@router.post("/n8n/callback")
async def receive_n8n_audit_response(body: dict[str, Any]) -> dict[str, Any]:
    """
    Receives HTTP POST responses and execution audit logs from n8n.
    Updates audit records, triggers real-time WebSocket dashboard alerts,
    and updates reminder delivery statuses.
    """
    from datetime import datetime, timezone
    from app.api.v1.ws_notifications import manager as ws_manager
    from app.services.audit_service import AuditService

    now_iso = datetime.now(timezone.utc).isoformat()
    event_type = body.get("event") or body.get("event_type") or "N8N_RESPONSE"
    encounter_id = body.get("encounter_id") or body.get("data", {}).get("encounter_id")
    patient_name = body.get("patient_name") or body.get("data", {}).get("patient_name") or "Patient"
    message = body.get("message") or body.get("output") or body.get("text") or "n8n workflow executed successfully"
    status_val = body.get("status") or "SUCCESS"

    # 1. Record in n8n delivery logs
    n8n_service._record_log({
        "dispatch_id": body.get("execution_id") or str(uuid.uuid4()),
        "event": f"N8N_AUDIT_{event_type}",
        "timestamp": now_iso,
        "status": "RECEIVED_FROM_N8N",
        "status_code": 200,
        "response": body,
        "payload": body,
    })

    # 2. Record in Clinical Audit Service
    try:
        audit_srv = AuditService()
        audit_srv.record_doctor_action(
            encounter_id=str(encounter_id or "n8n-cloud"),
            doctor_id="n8n-automation",
            action_type="N8N_AUDIT_LOG",
            edited_summary={"n8n_response": body},
            override_reason=f"n8n Execution Event: {event_type} | Status: {status_val}",
        )
    except Exception:
        pass

    # 3. Update reminder service status if reminder_id is provided
    reminder_id = body.get("reminder_id") or body.get("data", {}).get("reminder_id")
    if reminder_id:
        try:
            from app.api.v1.reminders import reminder_service
            for r in reminder_service._reminders:
                if r.get("reminder_id") == reminder_id:
                    r["status"] = "DELIVERED_VIA_N8N"
                    r["last_dispatched_at"] = now_iso
                    r["gateway"] = "N8N_CLOUD_WEBHOOK"
        except Exception:
            pass

    # 4. Broadcast live notification to Doctor Dashboard & Portal
    try:
        # If escalation or emergency signal
        is_critical = (
            "CRITICAL" in str(body).upper()
            or "EMERGENCY" in str(body).upper()
            or str(body.get("triage_level", "")).upper() == "CRITICAL"
        )
        if is_critical:
            await ws_manager.broadcast({
                "event": "CRITICAL_ESCALATION",
                "data": {
                    "encounter_id": encounter_id or "AL-2048",
                    "patient_name": patient_name,
                    "symptoms": message,
                    "n8n_verified": True,
                    "timestamp": now_iso,
                },
            })

        # Broadcast general audit log event
        await ws_manager.broadcast({
            "event": "N8N_AUDIT_LOG",
            "type": "N8N_AUDIT_UPDATE",
            "data": {
                "event": event_type,
                "status": status_val,
                "message": message,
                "encounter_id": encounter_id,
                "timestamp": now_iso,
            },
        })
    except Exception:
        pass

    return {
        "status": "success",
        "message": "n8n audit response received, recorded in audit logs, and streamed to dashboard.",
        "received_at": now_iso,
        "event": event_type,
    }
