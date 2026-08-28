"""
Arogya Link — api/v1/summary.py
===============================
Phase 10 — Gemini Clinical Summary & Contradiction Detection APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.engines.question_engine import QuestionEngine
from app.services.llm_service import LLMService

router = APIRouter(prefix="/summary", tags=["clinical_summary"])
q_engine = QuestionEngine()
llm_service = LLMService()


class GenerateSummaryRequest(BaseModel):
    encounter_id: str
    language: str = "en"


@router.post("/generate")
async def generate_summary(
    body: GenerateSummaryRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Generate Gemini 2.5 Flash clinical summary for encounter."""
    await validate_consented_encounter(body.encounter_id, db)
    answers = await q_engine.get_answers_dict(body.encounter_id, db)
    result = llm_service.generate_encounter_summary(body.encounter_id, answers, language=body.language)
    return result


@router.get("/encounter/{encounter_id}")
async def get_summary(
    encounter_id: str,
    language: str = "en",
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve synthesized summary for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    answers = await q_engine.get_answers_dict(encounter_id, db)
    result = llm_service.generate_encounter_summary(encounter_id, answers, language=language)
    return result
