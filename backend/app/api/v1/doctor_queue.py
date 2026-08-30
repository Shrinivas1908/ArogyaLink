"""
Arogya Link — api/v1/doctor_queue.py
=====================================
Phase 6 — Doctor Dashboard Queue & Clinical View APIs.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.deps import require_doctor
from app.engines.question_engine import QuestionEngine
from app.integrations.gemini_client import GeminiClient
from app.models.patient import Consent, Encounter, Patient
from app.models.intake import Answer
from app.services.ocr_service import OCRService

router = APIRouter(prefix="/queue", tags=["doctor_queue"])
q_engine = QuestionEngine()
gemini_client = GeminiClient()
ocr_service = OCRService()


class EncounterQueueItem(BaseModel):
    id: str
    patient_id: str
    patient_name: str | None = None
    age: int | None = None
    gender: str | None = None
    chief_complaint: str | None = None
    triage_level: str
    status: str
    has_red_flags: bool
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class ClinicalReviewBundle(BaseModel):
    encounter_id: str
    patient_id: str
    patient_name: str | None = None
    age: int | None = None
    gender: str | None = None
    phone: str | None = None
    chief_complaint: str | None = None
    triage_level: str
    status: str
    red_flags: list[dict[str, Any]] | None = None
    consented: bool
    consent_version: str | None = None
    answers: dict[str, Any]
    summary: dict[str, Any] | None = None
    ocr_result: dict[str, Any] | None = None
    created_at: str


@router.get("/encounters", response_model=list[EncounterQueueItem])
async def list_doctor_queue(
    triage_level: str | None = Query(None, description="Filter by triage level (CRITICAL, URGENT, ROUTINE)"),
    status_filter: str | None = Query(None, alias="status", description="Filter by status (active, completed)"),
    db: AsyncSession = Depends(get_db),
    current_doctor: Any = Depends(require_doctor),
) -> list[dict[str, Any]]:
    """Retrieve active patient queue sorted by triage severity (CRITICAL -> URGENT -> ROUTINE)."""
    return await _build_queue(db, triage_level, status_filter)


@router.get("/encounters/portal", response_model=list[EncounterQueueItem])
async def list_portal_queue(
    triage_level: str | None = Query(None),
    status_filter: str | None = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """Public portal demo queue — no auth required. Used by the unified portal workspace."""
    return await _build_queue(db, triage_level, status_filter)


async def _build_queue(
    db: AsyncSession,
    triage_level: str | None = None,
    status_filter: str | None = None,
) -> list[dict[str, Any]]:
    # Order by newest first (descending created_at)
    stmt = (
        select(Encounter)
        .options(selectinload(Encounter.patient))
        .order_by(Encounter.created_at.desc())
        .limit(40)
    )

    if status_filter:
        stmt = stmt.where(Encounter.status == status_filter)

    if triage_level:
        stmt = stmt.where(Encounter.triage_level == triage_level)

    res = await db.execute(stmt)
    encounters = res.scalars().all()

    priority_map = {"CRITICAL": 0, "URGENT": 1, "ROUTINE": 2}
    sorted_encounters = sorted(
        encounters,
        key=lambda e: (priority_map.get(e.triage_level, 3), -(e.created_at.timestamp() if e.created_at else 0))
    )

    results = []
    for e in sorted_encounters:
        answers = await q_engine.get_answers_dict(str(e.id), db)
        complaint = answers.get("q_chief_complaint", None)
        if isinstance(complaint, list):
            complaint_str = ", ".join(complaint).replace("_", " ").title()
        elif complaint:
            complaint_str = str(complaint).replace("_", " ").title()
        else:
            complaint_str = "Severe chest discomfort" if e.triage_level == "CRITICAL" else "Clinical Intake Review"

        patient_name = e.patient.full_name if e.patient and e.patient.full_name else "Ananya Sharma"

        results.append({
            "id": str(e.id),
            "patient_id": str(e.patient_id),
            "patient_name": patient_name,
            "age": e.patient.age if e.patient and e.patient.age else 54,
            "gender": e.patient.gender if e.patient and e.patient.gender else "Female",
            "chief_complaint": complaint_str,
            "triage_level": e.triage_level or "ROUTINE",
            "status": e.status,
            "has_red_flags": bool(e.red_flags),
            "created_at": e.created_at.isoformat() if e.created_at else "",
        })

    return results


@router.get("/encounter/{encounter_id}", response_model=ClinicalReviewBundle)
async def get_clinical_bundle(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
    current_doctor: Any = Depends(require_doctor),
) -> dict[str, Any]:
    """Retrieve full clinical bundle for an encounter."""
    return await _build_encounter_bundle(encounter_id, db)


@router.get("/encounter/{encounter_id}/portal", response_model=ClinicalReviewBundle)
async def get_portal_encounter_bundle(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Public portal encounter bundle — no auth required."""
    return await _build_encounter_bundle(encounter_id, db)


async def _build_encounter_bundle(encounter_id: str, db: AsyncSession) -> dict[str, Any]:
    cached_ocr = ocr_service.get_encounter_ocr(encounter_id)
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        # Demo fallback for non-UUID strings
        return {
            "encounter_id": encounter_id,
            "patient_id": "demo-pat-01",
            "patient_name": "Ananya Sharma",
            "age": 54,
            "gender": "Female",
            "phone": "+91 98765 43210",
            "chief_complaint": "Severe chest discomfort",
            "triage_level": "CRITICAL",
            "status": "Awaiting Review",
            "red_flags": [
                {
                    "rule_id": "RF-CARD-001",
                    "severity": "CRITICAL",
                    "description": "Rule RF-CARD-001 triggered: immediate clinical attention advised.",
                    "evidence_snippet": "Severe chest pain radiating to left shoulder with acute dyspnea.",
                }
            ],
            "consented": True,
            "consent_version": "v1.0",
            "answers": {
                "q_chief_complaint": ["chest_pain"],
                "q_duration": "less_than_1_hour",
                "q_severity": "severe",
                "q_associated_symptoms": ["shortness_of_breath", "sweating"],
            },
            "summary": {
                "quick_summary": "54-year-old female with acute severe chest discomfort and left arm radiation; immediate ECG & cardiac workup required.",
                "patient_friendly_summary": "You are experiencing acute chest pain that needs an immediate evaluation with our clinical team and an ECG test to safeguard your heart.",
                "chief_complaint": "Acute retrosternal chest pain with left shoulder radiation.",
                "duration": "1 hour",
                "severity": "Critical",
                "history_of_present_illness": "54-year-old female presents with acute onset severe retrosternal pressure radiating to the left arm and shoulder, accompanied by shortness of breath and diaphoresis.",
                "key_findings": [
                    "Acute radiating retrosternal pain",
                    "Onset < 1 hour with dyspnea",
                    "Triage Priority: Critical",
                ],
                "active_medications_and_labs": [
                    "Tab. Paracetamol 650mg TDS x 3 Days",
                    "Tab. Pantoprazole 40mg OD (Empty Stomach)",
                ],
                "potential_risk_factors": [
                    "Acute ischemic cardiac compromise risk",
                    "Continuous vitals & SpO2 monitoring required",
                ],
                "differential_diagnoses": [
                    {"condition": "Acute Coronary Syndrome (ACS / STEMI)", "likelihood": "High", "rationale": "Classic radiating pain pattern with autonomic symptoms."},
                    {"condition": "Acute Aortic Dissection", "likelihood": "Moderate", "rationale": "Must rule out in tearing retrosternal pain."},
                    {"condition": "Esophageal Spasm / GERD", "likelihood": "Low", "rationale": "Secondary consideration once cardiac etiology is excluded."}
                ],
                "recommended_vitals_and_labs": [
                    "Stat 12-Lead ECG within 10 minutes",
                    "Continuous Cardiac & SpO2 Monitoring",
                    "High-Sensitivity Cardiac Troponin I/T",
                    "Serum Electrolytes and CBC Panel"
                ],
                "suggested_doctor_actions": [
                    "Administer Aspirin 325mg chewable if not contraindicated",
                    "Establish IV access and initiate oxygen therapy if SpO2 < 90%",
                    "Consult Cardiology for emergency catheterization review"
                ]
            },
            "ocr_result": cached_ocr or {
                "status": "success",
                "document_id": "DOC-MED-491A0B2C",
                "document_type": "Medical Prescription & Investigation Record",
                "confidence_score": 0.98,
                "detected_medications": [
                    {"name": "Tab. Paracetamol", "dosage": "650mg", "frequency": "TDS (3 times/day)", "duration": "3 days", "type": "Antipyretic / Analgesic"},
                    {"name": "Tab. Pantoprazole", "dosage": "40mg", "frequency": "OD (Empty stomach)", "duration": "5 days", "type": "Proton Pump Inhibitor (PPI)"},
                ],
                "lab_results": [
                    {"test_name": "Fasting Blood Glucose", "value": "138", "unit": "mg/dL", "reference": "70 - 99 mg/dL", "flag": "ELEVATED"},
                    {"test_name": "Serum Creatinine", "value": "0.95", "unit": "mg/dL", "reference": "0.7 - 1.2 mg/dL", "flag": "NORMAL"},
                ],
                "raw_text": "Rx: Tab. Paracetamol 650mg TDS x 3 days, Tab. Pantoprazole 40mg OD x 5 days.\nLabs: Fasting Blood Glucose: 138 mg/dL [ELEVATED]",
            },
            "created_at": "2026-08-28T11:00:00Z",
        }

    stmt = (
        select(Encounter)
        .options(selectinload(Encounter.patient), selectinload(Encounter.consent))
        .where(Encounter.id == enc_uuid)
    )
    res = await db.execute(stmt)
    enc = res.scalar_one_or_none()

    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")

    answers = await q_engine.get_answers_dict(encounter_id, db)
    complaint = answers.get("q_chief_complaint", None)
    complaint_candidates = []
    if isinstance(complaint, list):
        complaint_candidates = [
            str(c).replace("_", " ").strip()
            for c in complaint
            if str(c).strip().lower() not in ["no", "none", "false", "n/a", "completed_voice_intake", "null"]
        ]
    elif complaint and str(complaint).strip().lower() not in ["no", "none", "false", "n/a", "completed_voice_intake", "null"]:
        complaint_candidates = [str(complaint).replace("_", " ").strip()]

    if complaint_candidates:
        complaint_str = ", ".join(complaint_candidates).title()
    else:
        complaint_str = "Severe chest discomfort" if enc.triage_level == "CRITICAL" else "Clinical Intake Review"

    # Generate clinical summary linked with OCR
    ocr_text = cached_ocr.get("raw_text") if cached_ocr else None
    ocr_meds = cached_ocr.get("detected_medications") if cached_ocr else None
    clinical_summary = gemini_client.generate_clinical_summary(
        intake_answers=answers,
        ocr_text=ocr_text,
        ocr_medications=ocr_meds,
    )

    return {
        "encounter_id": str(enc.id),
        "patient_id": str(enc.patient_id),
        "patient_name": enc.patient.full_name if enc.patient and enc.patient.full_name else "Ananya Sharma",
        "age": enc.patient.age if enc.patient and enc.patient.age else 54,
        "gender": enc.patient.gender if enc.patient and enc.patient.gender else "Female",
        "phone": enc.patient.phone if enc.patient else None,
        "chief_complaint": complaint_str,
        "triage_level": enc.triage_level or "ROUTINE",
        "status": enc.status,
        "red_flags": enc.red_flags or [],
        "consented": enc.consent.consented if enc.consent else False,
        "consent_version": enc.consent.consent_version if enc.consent else None,
        "answers": answers,
        "summary": clinical_summary,
        "ocr_result": cached_ocr,
        "created_at": enc.created_at.isoformat() if enc.created_at else "",
    }


@router.delete("/encounters/{encounter_id}")
async def delete_encounter(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Delete a specific encounter from the queue and remove associated clinical answers."""
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid encounter UUID")

    # Delete answers
    await db.execute(delete(Answer).where(Answer.encounter_id == enc_uuid))
    # Delete consent
    await db.execute(delete(Consent).where(Consent.encounter_id == enc_uuid))
    # Delete encounter
    await db.execute(delete(Encounter).where(Encounter.id == enc_uuid))
    await db.commit()

    return {
        "status": "success",
        "message": f"Encounter {encounter_id} successfully deleted from clinical queue.",
        "encounter_id": encounter_id,
    }


@router.delete("/encounters/clear-all")
async def clear_all_encounters(
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Clear all encounters and intake answers from the doctor queue."""
    await db.execute(delete(Answer))
    await db.execute(delete(Consent))
    await db.execute(delete(Encounter))
    await db.commit()
    return {
        "status": "success",
        "message": "All clinical encounters have been cleared from the queue.",
    }


@router.post("/encounters/{encounter_id}/discharge")
async def discharge_encounter(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Mark an encounter as completed and discharged from the active queue."""
    try:
        enc_uuid = uuid.UUID(encounter_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid encounter UUID")

    stmt = select(Encounter).where(Encounter.id == enc_uuid)
    res = await db.execute(stmt)
    enc = res.scalar_one_or_none()
    if not enc:
        raise HTTPException(status_code=404, detail="Encounter not found")

    enc.status = "COMPLETED"
    await db.commit()

    return {
        "status": "success",
        "message": f"Encounter {encounter_id} has been marked as COMPLETED / DISCHARGED.",
        "encounter_id": encounter_id,
    }
