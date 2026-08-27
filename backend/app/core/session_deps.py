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
from app.models.patient import Consent, Encounter


async def validate_consented_encounter(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> Encounter:
    """Validates that encounter_id exists, status is 'in_progress', and valid consent exists.

    Raises:
        HTTPException 400: Invalid UUID format or encounter inactive.
        HTTPException 404: Encounter not found.
        HTTPException 403: Missing or declined consent.
    """
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid encounter_id format (must be valid UUID).",
        )

    stmt = select(Encounter).where(Encounter.id == enc_uuid)
    result = await db.execute(stmt)
    encounter = result.scalar_one_or_none()

    if not encounter:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encounter not found.",
        )

    if encounter.status != "in_progress":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Encounter is not active (current status: {encounter.status}).",
        )

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
