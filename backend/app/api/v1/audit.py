"""
Arogya Link — api/v1/audit.py
=============================
Phase 11 — Doctor Approval & Audit Trail APIs.
"""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.services.audit_service import AuditService

router = APIRouter(prefix="/audit", tags=["audit_trail"])
audit_service = AuditService()


class ApproveSummaryRequest(BaseModel):
    encounter_id: str


class OverrideSummaryRequest(BaseModel):
    encounter_id: str
    edited_summary: dict[str, Any] = Field(default_factory=dict)
    override_reason: str = Field(..., example="Adjusted preliminary diagnosis based on clinical exam")


@router.post("/approve-summary")
async def approve_clinical_summary(
    body: ApproveSummaryRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Approve clinical summary as reviewed by on-duty physician."""
    log_entry = audit_service.record_doctor_action(
        encounter_id=body.encounter_id,
        doctor_id="doc-on-duty-01",
        action_type="APPROVED",
    )
    return {"status": "success", "encounter_id": body.encounter_id, "audit_record": log_entry}


@router.post("/override-summary")
async def override_clinical_summary(
    body: OverrideSummaryRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Override AI clinical summary with doctor modifications and rationale."""
    log_entry = audit_service.record_doctor_action(
        encounter_id=body.encounter_id,
        doctor_id="doc-on-duty-01",
        action_type="OVERRIDDEN",
        edited_summary=body.edited_summary,
        override_reason=body.override_reason,
    )
    return {"status": "success", "encounter_id": body.encounter_id, "audit_record": log_entry}


@router.get("/encounter/{encounter_id}")
async def get_audit_trail(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve full audit trail for an encounter."""
    trail = audit_service.get_encounter_audit_trail(encounter_id)
    return {"encounter_id": encounter_id, "logs": trail}
