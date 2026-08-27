"""
Arogya Link — AYUSHService (stub)
====================================
Phase: 16 — AYUSH Assessment Module

Responsibility
--------------
Drives the AYUSH (Ayurveda/Yoga/Unani/Siddha/Homeopathy) supplementary
assessment workflow.  Loads the AYUSH question bank from ``ayush_questions.json``
and presents Dashavidha Pariksha and Ahara-Vihara structured screens via the
same adaptive engine pattern used for the core intake.

Dependency order: implement AFTER Phase 4 (Adaptive Intake / QuestionEngine)
is complete, so the AYUSH workflow can reuse the same engine pattern.

Implementation target: Phase 16
"""

from __future__ import annotations

import json
import pathlib
from typing import Any

__all__ = ["AYUSHService"]

_AYUSH_QUESTIONS_PATH = pathlib.Path(__file__).parents[2] / "ayush_questions.json"


class AYUSHService:
    """Manages the AYUSH supplementary assessment workflow.

    All public methods raise :class:`NotImplementedError` until Phase 16.
    """

    def __init__(self) -> None:
        with _AYUSH_QUESTIONS_PATH.open(encoding="utf-8") as fh:
            self._bank: dict[str, Any] = json.load(fh)

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 16
    # ------------------------------------------------------------------

    def next_question(self, encounter_id: str, ayush_answers: dict[str, Any]) -> dict[str, Any]:
        """Return the next AYUSH assessment question.

        :raises NotImplementedError: until Phase 16 is implemented.
        """
        raise NotImplementedError("AYUSHService.next_question — implement in Phase 16")

    def save_assessment(self, encounter_id: str, ayush_answers: dict[str, Any]) -> None:
        """Persist the completed AYUSH assessment record.

        :raises NotImplementedError: until Phase 16 is implemented.
        """
        raise NotImplementedError("AYUSHService.save_assessment — implement in Phase 16")
