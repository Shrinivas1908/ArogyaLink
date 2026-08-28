"""Patient phone-number OTP authentication endpoints."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.patient import Encounter, Patient
from app.services.phone_otp_service import OTPError, PhoneOTPService, normalize_phone

router = APIRouter(prefix="/auth/phone", tags=["phone-auth"])
otp_service = PhoneOTPService()


class OTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=20)


class OTPVerificationRequest(OTPRequest):
    challenge_id: str
    otp: str = Field(..., min_length=1, max_length=6)
    kiosk_id: str | None = "kiosk-01"


def raise_otp_error(error: OTPError) -> None:
    raise HTTPException(status_code=error.status_code, detail=error.message)


@router.post("/request", status_code=status.HTTP_202_ACCEPTED)
async def request_phone_otp(body: OTPRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Issue an OTP without revealing whether the phone is registered."""
    try:
        phone = normalize_phone(body.phone)
        patient = await db.scalar(select(Patient).where(Patient.phone == phone))
        challenge_id = await otp_service.issue(db, phone, deliver=patient is not None)
        return {"message": "If this number is registered, a verification code has been sent.", "challenge_id": challenge_id}
    except OTPError as error:
        raise_otp_error(error)


@router.post("/resend", status_code=status.HTTP_202_ACCEPTED)
async def resend_phone_otp(body: OTPRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Resend a code under the same cooldown and hourly request limits."""
    try:
        phone = normalize_phone(body.phone)
        patient = await db.scalar(select(Patient).where(Patient.phone == phone))
        challenge_id = await otp_service.issue(db, phone, deliver=patient is not None)
        return {"message": "If this number is registered, a verification code has been sent.", "challenge_id": challenge_id}
    except OTPError as error:
        raise_otp_error(error)


@router.post("/verify")
async def verify_phone_otp(body: OTPVerificationRequest, db: AsyncSession = Depends(get_db)) -> dict[str, Any]:
    """Consume a valid OTP and start the existing patient encounter flow."""
    try:
        phone = await otp_service.verify(db, body.challenge_id, body.phone, body.otp)
    except OTPError as error:
        raise_otp_error(error)
    patient = await db.scalar(select(Patient).where(Patient.phone == phone))
    if not patient:
        raise HTTPException(status_code=401, detail="The verification code is invalid or expired.")
    encounter = Encounter(id=uuid.uuid4(), patient_id=patient.id, status="in_progress", kiosk_id=body.kiosk_id)
    db.add(encounter)
    await db.commit()
    await db.refresh(encounter)
    created_iso = encounter.created_at.isoformat() if encounter.created_at else datetime.now(timezone.utc).isoformat()
    return {
        "authenticated": True,
        "encounter_id": str(encounter.id),
        "patient_id": str(patient.id),
        "status": encounter.status,
        "created_at": created_iso,
        "full_name": patient.full_name,
    }