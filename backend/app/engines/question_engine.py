"""
Arogya Link — QuestionEngine (stub)
=====================================
Phase: 4 — Adaptive Clinical Intake

Responsibility
--------------
Drives the adaptive intake questionnaire.  Given the current encounter state
and the question bank loaded from ``questions.json``, this engine decides:

  * which question to ask next (``next_question``)
  * whether the intake is complete (``is_complete``)
  * how to record a submitted answer (``record_answer``)

The branching logic lives entirely on the server side so the frontend remains
a dumb renderer.  This keeps the adaptive logic testable without a browser.

Safety constraint
-----------------
This engine must NEVER call an external AI service.  All branching decisions
are deterministic and reproducible given the same input.

Implementation target: Phase 4
"""

from __future__ import annotations

import json
import pathlib
from typing import Any

__all__ = ["QuestionEngine"]

_QUESTIONS_PATH = pathlib.Path(__file__).parents[2] / "questions.json"


class QuestionEngine:
    """Drives adaptive clinical intake based on ``questions.json``.

    All public methods raise :class:`NotImplementedError` until Phase 4.
    """

    def __init__(self) -> None:
        # Load the question bank so startup failures are caught early.
        with _QUESTIONS_PATH.open(encoding="utf-8") as fh:
            self._bank: dict[str, Any] = json.load(fh)

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 4
    # ------------------------------------------------------------------

    def next_question(self, encounter_id: str, answers: dict[str, Any]) -> dict[str, Any]:
        """Return the next question for *encounter_id* given current *answers*.

        Returns a question object from the question bank, or an end-of-intake
        sentinel when all required questions are answered.

        :raises NotImplementedError: until Phase 4 is implemented.
        """
        raise NotImplementedError("QuestionEngine.next_question — implement in Phase 4")

    def is_complete(self, answers: dict[str, Any]) -> bool:
        """Return ``True`` when the intake questionnaire is fully complete.

        :raises NotImplementedError: until Phase 4 is implemented.
        """
        raise NotImplementedError("QuestionEngine.is_complete — implement in Phase 4")

    def record_answer(self, encounter_id: str, question_id: str, value: Any) -> None:
        """Persist a single answer and update the encounter state.

        :raises NotImplementedError: until Phase 4 is implemented.
        """
        raise NotImplementedError("QuestionEngine.record_answer — implement in Phase 4")
