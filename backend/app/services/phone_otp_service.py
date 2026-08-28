"""Secure phone OTP issuance, delivery, and verification."""

from __future__ import annotations

import hashlib
import hmac
import secrets
import uuid
from datetime import datetime, timedelta, timezone

import httpx
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.phone_otp import PhoneOTPChallenge


class OTPError(Exception):
    """Expected OTP flow error with a user-safe message and HTTP status."""

    def __init__(self, message: str, status_code: int = 400) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def normalize_phone(phone: str) -> str:
    value = "".join(phone.split())
    if value.startswith("00"):
        value = "+" + value[2:]
    if not value.startswith("+") or not value[1:].isdigit() or not 10 <= len(value[1:]) <= 15:
        raise OTPError("Enter a valid phone number with country code.")
    return value


class PhoneOTPService:
    def _hash(self, challenge_id: uuid.UUID, otp: str) -> str:
        secret = settings.otp_hash_secret or settings.supabase_service_role_key
        if not secret:
            raise OTPError("Phone verification is not configured.", 503)
        return hmac.new(
            secret.encode(), f"{challenge_id}:{otp}".encode(), hashlib.sha256
        ).hexdigest()

    async def send_sms(self, phone: str, otp: str) -> None:
        if not all((settings.twilio_account_sid, settings.twilio_auth_token, settings.twilio_from_number)):
            raise OTPError("SMS delivery is not configured.", 503)
        url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.twilio_account_sid}/Messages.json"
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                auth=(settings.twilio_account_sid, settings.twilio_auth_token),
                data={
                    "To": phone,
                    "From": settings.twilio_from_number,
                    "Body": f"Your ArogyaLink verification code is {otp}. It expires in 5 minutes.",
                },
            )
        if response.is_error:
            raise OTPError("We could not send the verification code. Try again later.", 503)

    async def issue(
        self, db: AsyncSession, phone: str, deliver: bool = True
    ) -> str:
        phone = normalize_phone(phone)
        now = datetime.now(timezone.utc)
        latest = await db.scalar(
            select(PhoneOTPChallenge)
            .where(PhoneOTPChallenge.phone == phone)
            .order_by(PhoneOTPChallenge.created_at.desc())
            .limit(1)
        )
        if latest and latest.created_at:
            latest_created = latest.created_at
            if latest_created.tzinfo is None:
                latest_created = latest_created.replace(tzinfo=timezone.utc)
            elapsed = (now - latest_created).total_seconds()
            if elapsed < settings.otp_resend_cooldown_secs:
                raise OTPError("Please wait before requesting another code.", 429)

        window_start = now - timedelta(hours=1)
        recent_count = await db.scalar(
            select(func.count(PhoneOTPChallenge.id)).where(
                PhoneOTPChallenge.phone == phone,
                PhoneOTPChallenge.created_at >= window_start,
            )
        )
        if (recent_count or 0) >= settings.otp_max_requests_per_hour:
            raise OTPError("Too many code requests. Try again later.", 429)

        otp = f"{secrets.randbelow(1_000_000):06d}"
        challenge_id = uuid.uuid4()
        challenge = PhoneOTPChallenge(
            id=challenge_id,
            phone=phone,
            otp_hash=self._hash(challenge_id, otp),
            expires_at=now + timedelta(seconds=settings.otp_expiry_secs),
            attempts=0,
        )
        db.add(challenge)
        await db.flush()
        if deliver:
            try:
                await self.send_sms(phone, otp)
            except Exception:
                await db.delete(challenge)
                await db.flush()
                raise
        return str(challenge.id)

    async def verify(self, db: AsyncSession, challenge_id: str, phone: str, otp: str) -> str:
        phone = normalize_phone(phone)
        try:
            challenge_uuid = uuid.UUID(challenge_id)
        except ValueError as exc:
            raise OTPError("The verification code is invalid or expired.") from exc
        challenge = await db.scalar(
            select(PhoneOTPChallenge).where(
                PhoneOTPChallenge.id == challenge_uuid,
                PhoneOTPChallenge.phone == phone,
            )
        )
        now = datetime.now(timezone.utc)
        if not challenge or challenge.consumed_at or challenge.expires_at <= now:
            raise OTPError("The verification code is invalid or expired.")
        if challenge.attempts >= settings.otp_max_attempts:
            raise OTPError("Too many incorrect attempts. Request a new code.", 429)
        if not otp.isdigit() or len(otp) != 6:
            challenge.attempts += 1
            raise OTPError("The verification code is incorrect.")
        expected = self._hash(challenge.id, otp)
        if not hmac.compare_digest(challenge.otp_hash, expected):
            challenge.attempts += 1
            raise OTPError("The verification code is incorrect.")
        challenge.consumed_at = now
        return phone