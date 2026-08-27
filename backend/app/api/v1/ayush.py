"""
Arogya Link — api/v1/ayush.py
=============================
Phase 14 — AYUSH Integrative Assessment APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.services.ayush_service import AyushService

router = APIRouter(prefix="/ayush", tags=["ayush"])
ayush_service = AyushService()


class AssessPrakritiRequest(BaseModel):
    encounter_id: str
    responses: dict[str, Any]


@router.post("/assess")
async def assess_prakriti(
    body: AssessPrakritiRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Assess AYUSH Prakriti constitution and integrative health guidelines."""
    await validate_consented_encounter(body.encounter_id, db)
    result = ayush_service.evaluate_prakriti(body.responses)
    result["encounter_id"] = body.encounter_id
    return result
