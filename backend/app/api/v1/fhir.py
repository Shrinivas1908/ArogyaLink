"""
Arogya Link — api/v1/fhir.py
============================
Phase 12 — FHIR R4 Export & ABDM Integration Endpoints.
"""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.engines.question_engine import QuestionEngine
from app.models.patient import Encounter
from app.services.abha_service import ABHAService
from app.services.fhir_service import FHIRService

router = APIRouter(prefix="/fhir", tags=["fhir_abdm"])
q_engine = QuestionEngine()
fhir_service = FHIRService()
abha_service = ABHAService()


class LinkABHARequest(BaseModel):
    encounter_id: str
    abha_number: str


async def _get_encounter_with_patient(encounter_id: str, db: AsyncSession) -> Encounter:
    await validate_consented_encounter(encounter_id, db)
    enc_uuid = uuid.UUID(encounter_id)
    stmt = select(Encounter).options(selectinload(Encounter.patient)).where(Encounter.id == enc_uuid)
    res = await db.execute(stmt)
    return res.scalar_one()


@router.get("/encounter/{encounter_id}")
async def get_fhir_bundle(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Export complete HL7 FHIR R4 JSON Bundle for an encounter."""
    enc = await _get_encounter_with_patient(encounter_id, db)
    answers = await q_engine.get_answers_dict(encounter_id, db)
    patient_name = enc.patient.full_name if enc.patient else "Anonymous"
    bundle = fhir_service.build_encounter_fhir_bundle(encounter_id, patient_name, answers)
    return bundle


@router.post("/link-abha")
async def link_abha_record(
    body: LinkABHARequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Verify ABHA ID and link encounter FHIR record to ABDM gateway."""
    enc = await _get_encounter_with_patient(body.encounter_id, db)
    answers = await q_engine.get_answers_dict(body.encounter_id, db)
    patient_name = enc.patient.full_name if enc.patient else "Anonymous"
    bundle = fhir_service.build_encounter_fhir_bundle(body.encounter_id, patient_name, answers)

    result = abha_service.verify_and_link(body.abha_number, bundle)
    return {"status": "success", "encounter_id": body.encounter_id, "abdm_result": result}
