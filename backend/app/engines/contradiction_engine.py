"""
Arogya Link — engines/contradiction_engine.py
==============================================
Phase 10 — Contradiction & Discrepancy Detection Engine.
"""

from __future__ import annotations

from typing import Any


class ContradictionEngine:
    """Detects logical contradictions between intake answers and OCR text or voice transcription."""

    def check_contradictions(
        self, intake_answers: dict[str, Any], ocr_text: str | None = None
    ) -> list[dict[str, Any]]:
        contradictions = []

        meds_answer = intake_answers.get("q_medications")
        if meds_answer == "no" and ocr_text and "Rx:" in ocr_text:
            contradictions.append({
                "type": "MEDICATION_DISCREPANCY",
                "severity": "HIGH",
                "description": "Patient reported NO active medications, but uploaded prescription OCR contains active Rx medications.",
            })

        return contradictions
