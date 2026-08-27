"""
Arogya Link — services/llm_service.py
======================================
Phase 10 — LLM & Gemini Summary Service.
"""

from __future__ import annotations

from typing import Any
from app.engines.contradiction_engine import ContradictionEngine
from app.integrations.gemini_client import GeminiClient


class LLMService:
    """Service combining Gemini clinical summary generation and contradiction detection."""

    def __init__(self) -> None:
        self.gemini_client = GeminiClient()
        self.contradiction_engine = ContradictionEngine()

    def generate_encounter_summary(
        self, encounter_id: str, answers: dict[str, Any], ocr_text: str | None = None
    ) -> dict[str, Any]:
        summary_data = self.gemini_client.generate_clinical_summary(answers)
        contradictions = self.contradiction_engine.check_contradictions(answers, ocr_text=ocr_text)

        return {
            "encounter_id": encounter_id,
            "summary": summary_data,
            "has_contradictions": len(contradictions) > 0,
            "contradictions": contradictions,
        }
