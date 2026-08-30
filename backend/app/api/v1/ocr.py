"""
Arogya Link — api/v1/ocr.py
===========================
Phase 8 — Document OCR API Endpoints.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.engines.question_engine import QuestionEngine
from app.services.ocr_service import OCRService

router = APIRouter(prefix="/ocr", tags=["ocr"])
ocr_service = OCRService()
q_engine = QuestionEngine()


@router.post("/process")
async def process_document_ocr(
    encounter_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Upload prescription image or PDF for medical OCR extraction."""
    await validate_consented_encounter(encounter_id, db)
    file_bytes = await file.read()
    filename = file.filename or ""
    result = ocr_service.process_prescription(encounter_id, file_bytes, filename=filename)

    # Auto-link extracted active medications into clinical intake answers
    if result and result.get("detected_medications"):
        med_list = [f"{m.get('name')} {m.get('dosage', '')}".strip() for m in result["detected_medications"]]
        try:
            await q_engine.record_answer(encounter_id, "q_medications", "yes", db)
            await q_engine.record_answer(encounter_id, "q_medication_details", med_list, db)
        except Exception:
            pass

    return result


@router.get("/encounter/{encounter_id}")
async def get_encounter_ocr_result(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve extracted OCR prescription data for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    result = ocr_service.get_encounter_ocr(encounter_id)
    if not result:
        return {
            "status": "not_uploaded",
            "encounter_id": encounter_id,
            "detected_medications": [],
            "lab_results": [],
            "raw_text": "",
        }
    return result
