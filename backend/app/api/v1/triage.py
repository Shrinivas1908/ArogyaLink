"""
Arogya Link — api/v1/triage.py
==============================
Deterministic Triage & Red-Flag APIs.
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
from app.engines.red_flag_engine import RedFlagEngine
from app.services.escalation_service import EscalationService

router = APIRouter(prefix="/triage", tags=["triage"])
q_engine = QuestionEngine()
rf_engine = RedFlagEngine()
escalation_service = EscalationService()


class EvaluateTriageRequest(BaseModel):
    encounter_id: str


class TriageStatusResponse(BaseModel):
    encounter_id: str
    triage_level: str
    has_red_flags: bool
    triggered_flags: list[dict[str, Any]]
    requires_immediate_escalation: bool

    model_config = ConfigDict(from_attributes=True)


@router.post("/evaluate", response_model=TriageStatusResponse)
async def evaluate_triage(
    body: EvaluateTriageRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Evaluate intake answers for an encounter and update triage status."""
    await validate_consented_encounter(body.encounter_id, db)

    answers = await q_engine.get_answers_dict(body.encounter_id, db)
    eval_result = rf_engine.evaluate_answers(answers)
    await rf_engine.save_evaluation(body.encounter_id, eval_result, db)

    # Phase 7: Trigger real-time WebSocket escalation if red flags are detected
    if eval_result["has_red_flags"]:
        await escalation_service.trigger_escalation(
            encounter_id=body.encounter_id,
            triage_level=eval_result["triage_level"],
            red_flags=eval_result["triggered_flags"],
        )

    return {
        "encounter_id": body.encounter_id,
        "triage_level": eval_result["triage_level"],
        "has_red_flags": eval_result["has_red_flags"],
        "triggered_flags": eval_result["triggered_flags"],
        "requires_immediate_escalation": eval_result["requires_immediate_escalation"],
    }


@router.get("/status/{encounter_id}", response_model=TriageStatusResponse)
async def get_triage_status(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Get current triage evaluation for an encounter."""
    enc = await validate_consented_encounter(encounter_id, db)

    answers = await q_engine.get_answers_dict(encounter_id, db)
    eval_result = rf_engine.evaluate_answers(answers)

    return {
        "encounter_id": encounter_id,
        "triage_level": enc.triage_level or eval_result["triage_level"],
        "has_red_flags": bool(enc.red_flags or eval_result["has_red_flags"]),
        "triggered_flags": enc.red_flags or eval_result["triggered_flags"],
        "requires_immediate_escalation": (enc.triage_level == "CRITICAL"),
    }


class DemoTriageRequest(BaseModel):
    """Public demo triage — accepts symptom labels directly, no encounter required."""
    symptoms: list[str]


@router.post("/demo", tags=["triage"])
async def demo_triage(body: DemoTriageRequest) -> dict[str, Any]:
    """Public portal demo triage — evaluates symptom names using the red-flag engine rules.
    No encounter_id or authentication required. Used by the SymptomTriageWidget."""
    # Convert symptom labels to answer dict format the red-flag engine understands
    answers: dict[str, Any] = {}
    symptom_map = {
        "Chest Pain or Tightness": {"chief_complaint": "chest_pain", "chest_pain_severity": "severe"},
        "Difficulty Breathing": {"chief_complaint": "breathlessness", "breathlessness_severity": "severe"},
        "High Fever (> 102°F)": {"chief_complaint": "fever", "fever_temperature": "103"},
        "Severe Headache": {"chief_complaint": "headache", "headache_severity": "severe"},
        "Dizziness or Fainting": {"chief_complaint": "dizziness", "consciousness": "syncope"},
        "Abdominal Pain": {"chief_complaint": "abdominal_pain", "pain_severity": "moderate"},
    }
    for sym in body.symptoms:
        sym_answers = symptom_map.get(sym, {})
        answers.update(sym_answers)

    eval_result = rf_engine.evaluate_answers(answers)
    return {
        "symptoms_evaluated": body.symptoms,
        "triage_level": eval_result.get("triage_level", "ROUTINE"),
        "has_red_flags": eval_result.get("has_red_flags", False),
        "triggered_flags": eval_result.get("triggered_flags", []),
        "requires_immediate_escalation": eval_result.get("requires_immediate_escalation", False),
    }
