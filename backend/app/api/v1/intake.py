"""
Arogya Link — api/v1/intake.py
===============================
Adaptive Clinical Intake API Endpoints.

Endpoints:
  - GET  /intake/next-question?encounter_id=... : Fetch next question for encounter.
  - POST /intake/answer                          : Submit answer and get next question.
  - GET  /intake/answers/{encounter_id}          : Get all submitted answers for encounter.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.engines.question_engine import QuestionEngine
from app.models.patient import Encounter

router = APIRouter(prefix="/intake", tags=["intake"])
engine = QuestionEngine()


class SubmitAnswerRequest(BaseModel):
    encounter_id: str
    question_id: str
    answer_value: Any


class NextQuestionResponse(BaseModel):
    encounter_id: str
    question: dict[str, Any] | None = None
    is_complete: bool

    model_config = ConfigDict(from_attributes=True)


class SubmitAnswerResponse(BaseModel):
    encounter_id: str
    recorded: bool
    question_id: str
    next_question: dict[str, Any] | None = None
    is_complete: bool


@router.get("/next-question", response_model=NextQuestionResponse)
async def get_next_question(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Fetch the next clinical intake question for an active consented encounter."""
    # 1. Validate encounter exists, is active, and has consent
    await validate_consented_encounter(encounter_id, db)

    # 2. Retrieve submitted answers dictionary
    answers = await engine.get_answers_dict(encounter_id, db)

    # 3. Calculate next question
    next_q = engine.next_question(encounter_id, answers)
    is_comp = engine.is_complete(answers)

    return {
        "encounter_id": encounter_id,
        "question": next_q,
        "is_complete": is_comp,
    }


@router.post("/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    body: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Submit an answer to a question and receive the next question in sequence."""
    # 1. Validate encounter exists, is active, and has consent
    await validate_consented_encounter(body.encounter_id, db)

    # 2. Record answer in DB
    await engine.record_answer(
        encounter_id=body.encounter_id,
        question_id=body.question_id,
        value=body.answer_value,
        db=db,
    )

    # 3. Fetch updated answers
    answers = await engine.get_answers_dict(body.encounter_id, db)

    # 4. Determine next question & completion status
    next_q = engine.next_question(body.encounter_id, answers)
    is_comp = engine.is_complete(answers)

    return {
        "encounter_id": body.encounter_id,
        "recorded": True,
        "question_id": body.question_id,
        "next_question": next_q,
        "is_complete": is_comp,
    }


@router.get("/answers/{encounter_id}")
async def get_encounter_answers(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve all submitted intake answers for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    answers = await engine.get_answers_dict(encounter_id, db)
    return {
        "encounter_id": encounter_id,
        "answers_count": len(answers),
        "answers": answers,
    }
