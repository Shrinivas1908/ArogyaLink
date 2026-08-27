"""
Arogya Link — api/v1/audit.py
=============================
Phase 11 — Doctor Approval & Audit Trail APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import AuthUser, require_doctor
from app.core.session_deps import validate_consented_encounter
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["audit_trail"])
audit_service = AuditService()


class ApproveSummaryRequest(BaseModel):
    encounter_id: str


class OverrideSummaryRequest(BaseModel):
    encounter_id: str
    edited_summary: dict[str, Any]
    override_reason: str


@router.post("/approve-summary")
async def approve_clinical_summary(
    body: ApproveSummaryRequest,
    db: AsyncSession = Depends(get_db),
    doctor: AuthUser = Depends(require_doctor),
) -> dict[str, Any]:
    """Approve clinical summary as reviewed by on-duty physician."""
    await validate_consented_encounter(body.encounter_id, db)
    log_entry = audit_service.record_doctor_action(
        encounter_id=body.encounter_id,
        doctor_id=doctor.id,
        action_type="APPROVED",
    )
    return {"status": "success", "audit_record": log_entry}


@router.post("/override-summary")
async def override_clinical_summary(
    body: OverrideSummaryRequest,
    db: AsyncSession = Depends(get_db),
    doctor: AuthUser = Depends(require_doctor),
) -> dict[str, Any]:
    """Override AI clinical summary with doctor modifications and rationale."""
    await validate_consented_encounter(body.encounter_id, db)
    log_entry = audit_service.record_doctor_action(
        encounter_id=body.encounter_id,
        doctor_id=doctor.id,
        action_type="OVERRIDDEN",
        edited_summary=body.edited_summary,
        override_reason=body.override_reason,
    )
    return {"status": "success", "audit_record": log_entry}


@router.get("/encounter/{encounter_id}")
async def get_audit_trail(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
    doctor: AuthUser = Depends(require_doctor),
) -> dict[str, Any]:
    """Retrieve full audit trail for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    trail = audit_service.get_encounter_audit_trail(encounter_id)
    return {"encounter_id": encounter_id, "logs": trail}
