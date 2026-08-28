"""
Arogya Link — services/llm_service.py
======================================
Phase 10 — LLM & Gemini Summary Service with OCR Linkage.
"""

from __future__ import annotations

from typing import Any
from app.engines.contradiction_engine import ContradictionEngine
from app.integrations.gemini_client import GeminiClient
from app.services.ocr_service import OCRService


class LLMService:
    """Service combining Gemini clinical summary generation, OCR linkage, and contradiction detection."""

    def __init__(self) -> None:
        self.gemini_client = GeminiClient()
        self.contradiction_engine = ContradictionEngine()
        self.ocr_service = OCRService()

    def generate_encounter_summary(
        self,
        encounter_id: str,
        answers: dict[str, Any],
        ocr_text: str | None = None,
        ocr_medications: list[dict[str, Any]] | None = None,
        language: str = "en",
    ) -> dict[str, Any]:
        """Generate clinical summary with OCR text linkage and contradiction analysis."""
        # Check if OCR result is cached for this encounter
        if not ocr_text or not ocr_medications:
            cached_ocr = self.ocr_service.get_encounter_ocr(encounter_id)
            if cached_ocr:
                ocr_text = ocr_text or cached_ocr.get("raw_text")
                ocr_medications = ocr_medications or cached_ocr.get("detected_medications")

        summary_data = self.gemini_client.generate_clinical_summary(
            intake_answers=answers,
            ocr_text=ocr_text,
            ocr_medications=ocr_medications,
            language=language,
        )
        contradictions = self.contradiction_engine.check_contradictions(answers, ocr_text=ocr_text)

        return {
            "encounter_id": encounter_id,
            "summary": summary_data,
            "has_contradictions": len(contradictions) > 0,
            "contradictions": contradictions,
        }
