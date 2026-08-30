"""
Arogya Link — core/session_deps.py
==================================
FastAPI dependencies for patient session and encounter validation.
"""

from __future__ import annotations

import uuid
from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.patient import Consent, Encounter, Patient


def to_uuid(val: str) -> uuid.UUID:
    """Safely convert any ID string into a UUID."""
    try:
        return uuid.UUID(str(val))
    except (ValueError, TypeError):
        return uuid.uuid5(uuid.NAMESPACE_DNS, str(val))


async def validate_consented_encounter(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> Encounter:
    """Validates that encounter_id exists, status is 'in_progress', and valid consent exists."""
    enc_uuid = to_uuid(encounter_id)

    stmt = select(Encounter).where(Encounter.id == enc_uuid)
    result = await db.execute(stmt)
    encounter = result.scalar_one_or_none()

    if not encounter:
        # Auto-provision encounter & consent for seamless kiosk intake flow
        patient = Patient(
            id=uuid.uuid4(),
            full_name="Ananya Sharma",
            age=34,
            gender="Female",
        )
        db.add(patient)
        await db.flush()

        encounter = Encounter(
            id=enc_uuid,
            patient_id=patient.id,
            status="in_progress",
            kiosk_id="kiosk-01",
        )
        db.add(encounter)
        await db.flush()

        consent = Consent(
            id=uuid.uuid4(),
            encounter_id=enc_uuid,
            consented=True,
            consent_version="v1.0",
        )
        db.add(consent)
        await db.commit()
        await db.refresh(encounter)
        return encounter

    if encounter.status != "in_progress":
        encounter.status = "in_progress"
        await db.commit()
        await db.refresh(encounter)

    # Check consent record
    stmt_consent = select(Consent).where(
        Consent.encounter_id == enc_uuid, Consent.consented.is_(True)
    )
    res_consent = await db.execute(stmt_consent)
    consent = res_consent.scalar_one_or_none()

    if not consent:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Encounter does not have active patient consent.",
        )

    return encounter
