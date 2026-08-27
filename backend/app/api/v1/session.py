"""
Arogya Link — api/v1/session.py
=================================
Patient Session & Consent API endpoints.

Endpoints:
  - POST /session           : Start new patient check-in session (Patient + Encounter).
  - POST /consent           : Record versioned patient consent event.
  - GET  /session/{enc_id}  : Retrieve session state and consent status.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.patient import Consent, Encounter, Patient

router = APIRouter(tags=["session"])


# ── Schemas ─────────────────────────────────────────────────────────────
class StartSessionRequest(BaseModel):
    full_name: str | None = Field(default=None, json_schema_extra={"example": "Aarav Sharma"})
    age: int | None = Field(default=None, json_schema_extra={"example": 34})
    gender: str | None = Field(default=None, json_schema_extra={"example": "Male"})
    phone: str | None = Field(default=None, json_schema_extra={"example": "+919876543210"})
    kiosk_id: str | None = Field(default="kiosk-01", json_schema_extra={"example": "kiosk-01"})


class StartSessionResponse(BaseModel):
    encounter_id: str
    patient_id: str
    status: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class RecordConsentRequest(BaseModel):
    encounter_id: str
    consented: bool = True
    consent_version: str = "v1.0"


class RecordConsentResponse(BaseModel):
    encounter_id: str
    consent_id: str | None = None
    consented: bool
    consent_version: str
    status: str


class SessionStatusResponse(BaseModel):
    encounter_id: str
    patient_id: str
    status: str
    consented: bool
    consent_version: str | None = None
    patient: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)


# ── Handlers ────────────────────────────────────────────────────────────
@router.post("/session", response_model=StartSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session(
    body: StartSessionRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Start a new patient check-in session at the Kiosk."""
    patient = Patient(
        full_name=body.full_name,
        age=body.age,
        gender=body.gender,
        phone=body.phone,
    )
    db.add(patient)
    await db.flush()

    encounter = Encounter(
        patient_id=patient.id,
        status="in_progress",
        kiosk_id=body.kiosk_id,
    )
    db.add(encounter)
    await db.commit()
    await db.refresh(encounter)

    return {
        "encounter_id": str(encounter.id),
        "patient_id": str(patient.id),
        "status": encounter.status,
        "created_at": encounter.created_at.isoformat(),
    }


@router.post("/consent", response_model=RecordConsentResponse)
async def record_consent(
    body: RecordConsentRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Record patient consent for a specific encounter session."""
    try:
        enc_uuid = uuid.UUID(body.encounter_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid encounter_id format (must be valid UUID).",
        )

    stmt = select(Encounter).where(Encounter.id == enc_uuid)
    res = await db.execute(stmt)
    encounter = res.scalar_one_or_none()

    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    if encounter.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Encounter is not active (status: {encounter.status}).",
        )

    if not body.consented:
        encounter.status = "cancelled"
        await db.commit()
        return {
            "encounter_id": str(encounter.id),
            "consent_id": None,
            "consented": False,
            "consent_version": body.consent_version,
            "status": "declined",
        }

    # Upsert or create consent record
    stmt_consent = select(Consent).where(Consent.encounter_id == enc_uuid)
    c_res = await db.execute(stmt_consent)
    consent = c_res.scalar_one_or_none()

    if not consent:
        consent = Consent(
            encounter_id=enc_uuid,
            consented=True,
            consent_version=body.consent_version,
        )
        db.add(consent)
    else:
        consent.consented = True
        consent.consent_version = body.consent_version

    await db.commit()
    await db.refresh(consent)

    return {
        "encounter_id": str(encounter.id),
        "consent_id": str(consent.id),
        "consented": True,
        "consent_version": consent.consent_version,
        "status": "consented",
    }


@router.get("/session/{encounter_id}", response_model=SessionStatusResponse)
async def get_session_status(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve session status, patient metadata, and consent state for an encounter."""
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid encounter_id format (must be valid UUID).",
        )

    stmt = select(Encounter).where(Encounter.id == enc_uuid)
    res = await db.execute(stmt)
    encounter = res.scalar_one_or_none()

    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    stmt_p = select(Patient).where(Patient.id == encounter.patient_id)
    p_res = await db.execute(stmt_p)
    patient = p_res.scalar_one_or_none()

    stmt_c = select(Consent).where(Consent.encounter_id == enc_uuid)
    c_res = await db.execute(stmt_c)
    consent = c_res.scalar_one_or_none()

    return {
        "encounter_id": str(encounter.id),
        "patient_id": str(encounter.patient_id),
        "status": encounter.status,
        "consented": consent.consented if consent else False,
        "consent_version": consent.consent_version if consent else None,
        "patient": {
            "full_name": patient.full_name if patient else None,
            "age": patient.age if patient else None,
            "gender": patient.gender if patient else None,
            "phone": patient.phone if patient else None,
        } if patient else None,
    }
