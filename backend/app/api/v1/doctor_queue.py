"""
Arogya Link — api/v1/doctor_queue.py
=====================================
Phase 6 — Doctor Dashboard Queue & Clinical View APIs.

Endpoints:
  - GET /queue/encounters : Fetch active patient queue sorted by triage severity (CRITICAL -> URGENT -> ROUTINE).
  - GET /queue/encounter/{id} : Fetch complete patient intake file for clinical review.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_doctor
from app.engines.question_engine import QuestionEngine
from app.models.patient import Consent, Encounter, Patient

router = APIRouter(prefix="/queue", tags=["doctor_queue"])
q_engine = QuestionEngine()


class EncounterQueueItem(BaseModel):
    id: str
    patient_id: str
    patient_name: str | None = None
    age: int | None = None
    gender: str | None = None
    triage_level: str
    status: str
    has_red_flags: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class ClinicalReviewBundle(BaseModel):
    encounter_id: str
    patient_id: str
    patient_name: str | None = None
    age: int | None = None
    gender: str | None = None
    phone: str | None = None
    triage_level: str
    status: str
    red_flags: list[dict[str, Any]] | None = None
    consented: bool
    consent_version: str | None = None
    answers: dict[str, Any]
    created_at: str


@router.get("/encounters", response_model=list[EncounterQueueItem])
async def list_doctor_queue(
    triage_level: str | None = Query(None, description="Filter by triage level (CRITICAL, URGENT, ROUTINE)"),
    status_filter: str | None = Query(None, alias="status", description="Filter by status (active, completed)"),
    db: AsyncSession = Depends(get_db),
    current_doctor: Any = Depends(require_doctor),
) -> list[dict[str, Any]]:
    """Retrieve active patient queue sorted by triage severity (CRITICAL -> URGENT -> ROUTINE)."""
    return await _build_queue(db, triage_level, status_filter)


@router.get("/encounters/portal", response_model=list[EncounterQueueItem])
async def list_portal_queue(
    triage_level: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """Public portal demo queue — no auth required. Used by the unified portal workspace."""
    return await _build_queue(db, triage_level, status_filter)


async def _build_queue(
    db: AsyncSession,
    triage_level: str | None = None,
    status_filter: str | None = None,
) -> list[dict[str, Any]]:
    stmt = select(Encounter).options(selectinload(Encounter.patient)).order_by(Encounter.created_at.desc())

    if status_filter:
        stmt = stmt.where(Encounter.status == status_filter)

    if triage_level:
        stmt = stmt.where(Encounter.triage_level == triage_level)

    res = await db.execute(stmt)
    encounters = res.scalars().all()

    priority_map = {"CRITICAL": 0, "URGENT": 1, "ROUTINE": 2}
    sorted_encounters = sorted(encounters, key=lambda e: (priority_map.get(e.triage_level, 3), e.created_at))

    return [
        {
            "id": str(e.id),
            "patient_id": str(e.patient_id),
            "patient_name": e.patient.full_name if e.patient else "Anonymous",
            "age": e.patient.age if e.patient else None,
            "gender": e.patient.gender if e.patient else None,
            "triage_level": e.triage_level,
            "status": e.status,
            "has_red_flags": bool(e.red_flags),
            "created_at": e.created_at.isoformat() if e.created_at else "",
        }
        for e in sorted_encounters
    ]


@router.get("/encounter/{encounter_id}", response_model=ClinicalReviewBundle)
async def get_clinical_bundle(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
    current_doctor: Any = Depends(require_doctor),
) -> dict[str, Any]:
    """Retrieve full clinical bundle (demographics, consent, answers, triage) for an encounter."""
    return await _build_encounter_bundle(encounter_id, db)


@router.get("/encounter/{encounter_id}/portal", response_model=ClinicalReviewBundle)
async def get_portal_encounter_bundle(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Public portal encounter bundle — no auth required. Used by unified portal workspace."""
    return await _build_encounter_bundle(encounter_id, db)


async def _build_encounter_bundle(encounter_id: str, db: AsyncSession) -> dict[str, Any]:
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid encounter ID UUID format")

    stmt = (
        select(Encounter)
        .options(selectinload(Encounter.patient), selectinload(Encounter.consent))
        .where(Encounter.id == enc_uuid)
    )
    res = await db.execute(stmt)
    enc = res.scalar_one_or_none()

    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")

    answers = await q_engine.get_answers_dict(encounter_id, db)

    return {
        "encounter_id": str(enc.id),
        "patient_id": str(enc.patient_id),
        "patient_name": enc.patient.full_name if enc.patient else "Anonymous",
        "age": enc.patient.age if enc.patient else None,
        "gender": enc.patient.gender if enc.patient else None,
        "phone": enc.patient.phone if enc.patient else None,
        "triage_level": enc.triage_level,
        "status": enc.status,
        "red_flags": enc.red_flags or [],
        "consented": enc.consent.consented if enc.consent else False,
        "consent_version": enc.consent.consent_version if enc.consent else None,
        "answers": answers,
        "created_at": enc.created_at.isoformat() if enc.created_at else "",
    }
