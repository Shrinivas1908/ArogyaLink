"""
Arogya Link — api/v1/session.py
=================================
Patient Session & Consent API endpoints.

Endpoints:
  - POST /session           : Start new patient check-in session (Patient + Encounter).
  - POST /consent           : Record versioned patient consent event.
  - GET  /session/{enc_id}  : Retrieve session state and consent status.
"""

from datetime import datetime, timezone
import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.patient import Consent, Encounter, Patient

from app.services.abha_service import ABHAService

router = APIRouter(tags=["session"])
abha_service = ABHAService()


# ── Schemas ─────────────────────────────────────────────────────────────
class StartSessionRequest(BaseModel):
    full_name: str | None = Field(default=None, json_schema_extra={"example": "Aarav Sharma"})
    age: int | None = Field(default=None, json_schema_extra={"example": 34})
    gender: str | None = Field(default=None, json_schema_extra={"example": "Male"})
    phone: str | None = Field(default=None, json_schema_extra={"example": "+919876543210"})
    kiosk_id: str | None = Field(default="kiosk-01", json_schema_extra={"example": "kiosk-01"})
    abha_number: str | None = Field(default=None, json_schema_extra={"example": "91-4820-9182-3491"})
    abha_address: str | None = Field(default=None, json_schema_extra={"example": "aarav@abdm"})


class AbhaLoginRequest(BaseModel):
    abha_id: str = Field(..., json_schema_extra={"example": "91-4820-9182-3491"})
    pin: str = Field(default="1234", json_schema_extra={"example": "1234"})
    kiosk_id: str | None = Field(default="kiosk-01", json_schema_extra={"example": "kiosk-01"})


class StartSessionResponse(BaseModel):
    encounter_id: str
    patient_id: str
    status: str
    created_at: str
    abha_number: str | None = None
    abha_address: str | None = None
    full_name: str | None = None

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
        id=uuid.uuid4(),
        full_name=body.full_name,
        age=body.age,
        gender=body.gender,
        phone=body.phone,
        abha_number=body.abha_number,
        abha_address=body.abha_address,
    )
    db.add(patient)
    await db.flush()

    encounter = Encounter(
        id=uuid.uuid4(),
        patient_id=patient.id,
        status="in_progress",
        kiosk_id=body.kiosk_id,
    )
    db.add(encounter)
    await db.commit()
    await db.refresh(encounter)

    created_iso = encounter.created_at.isoformat() if encounter.created_at else datetime.now(timezone.utc).isoformat()

    try:
        from app.api.v1.ws_notifications import manager
        await manager.broadcast({
            "event": "PATIENT_CHECKIN",
            "data": {
                "encounter_id": str(encounter.id),
                "patient_name": patient.full_name or "Aarav Sharma",
                "triage_level": encounter.triage_level or "ROUTINE",
                "time": created_iso,
            }
        })
    except Exception:
        pass

    return {
        "encounter_id": str(encounter.id),
        "patient_id": str(patient.id),
        "status": encounter.status,
        "created_at": created_iso,
        "abha_number": patient.abha_number,
        "abha_address": patient.abha_address,
        "full_name": patient.full_name,
    }


@router.post("/session/abha", response_model=StartSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_session_via_abha(
    body: AbhaLoginRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Instant Synthetic ABHA ID + PIN patient login and session initialization."""
    auth_result = abha_service.authenticate_abha_pin(body.abha_id, body.pin)

    # Check if patient already exists with this ABHA number
    abha_num = auth_result["abha_number"]
    stmt = select(Patient).where(Patient.abha_number == abha_num)
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()

    if not patient:
        patient = Patient(
            id=uuid.uuid4(),
            full_name=auth_result["full_name"],
            age=auth_result["age"],
            gender=auth_result["gender"],
            phone=auth_result["phone"],
            abha_number=abha_num,
            abha_address=auth_result["abha_address"],
        )
        db.add(patient)
        await db.flush()

    encounter = Encounter(
        id=uuid.uuid4(),
        patient_id=patient.id,
        status="in_progress",
        kiosk_id=body.kiosk_id,
    )
    db.add(encounter)
    await db.commit()
    await db.refresh(encounter)

    created_iso = encounter.created_at.isoformat() if encounter.created_at else datetime.now(timezone.utc).isoformat()

    try:
        from app.api.v1.ws_notifications import manager
        await manager.broadcast({
            "event": "PATIENT_CHECKIN",
            "data": {
                "encounter_id": str(encounter.id),
                "patient_name": patient.full_name or "Ananya Sharma",
                "triage_level": encounter.triage_level or "ROUTINE",
                "time": created_iso,
            }
        })
    except Exception:
        pass

    return {
        "encounter_id": str(encounter.id),
        "patient_id": str(patient.id),
        "status": encounter.status,
        "created_at": created_iso,
        "abha_number": patient.abha_number,
        "abha_address": patient.abha_address,
        "full_name": patient.full_name,
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
            "abha_number": patient.abha_number if patient else None,
            "abha_address": patient.abha_address if patient else None,
        } if patient else None,
    }
