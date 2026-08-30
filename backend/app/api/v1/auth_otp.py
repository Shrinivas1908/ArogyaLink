"""
Arogya Link — api/v1/auth_otp.py
=================================
FastAPI Endpoints for Patient Mobile OTP Authentication & Health Locker Access.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.services.otp_service import otp_service

router = APIRouter(prefix="/auth/otp", tags=["auth_otp"])


class SendOTPRequest(BaseModel):
    phone: str


class VerifyOTPRequest(BaseModel):
    phone: str
    otp: str


@router.post("/send")
async def send_otp(body: SendOTPRequest) -> dict[str, Any]:
    """Generate and dispatch a 6-digit OTP code to the patient's mobile number."""
    result = await otp_service.send_otp(body.phone)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("message", "Failed to send OTP."),
        )
    return result


@router.post("/verify")
async def verify_otp(body: VerifyOTPRequest) -> dict[str, Any]:
    """Verify submitted OTP code and grant access to patient health records."""
    result = await otp_service.verify_otp(body.phone, body.otp)
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=result.get("message", "Invalid OTP."),
        )
    return result
