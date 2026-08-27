"""
Arogya Link — QuestionEngine
=============================
Phase: 4 — Adaptive Clinical Intake

Drives deterministic clinical intake using questions.json.
Determines next question, records answers, and evaluates intake completion.
"""

from __future__ import annotations

import json
import pathlib
import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.intake import Answer

__all__ = ["QuestionEngine"]

_QUESTIONS_PATH = pathlib.Path(__file__).parents[2] / "questions.json"


class QuestionEngine:
    """Drives adaptive clinical intake based on questions.json."""

    def __init__(self) -> None:
        with _QUESTIONS_PATH.open(encoding="utf-8") as fh:
            self._bank: dict[str, Any] = json.load(fh)

        self._start_id: str = self._bank.get("start_question_id", "q_chief_complaint")
        self._questions: list[dict[str, Any]] = self._bank.get("questions", [])
        self._q_map: dict[str, dict[str, Any]] = {q["id"]: q for q in self._questions}

    def get_question(self, question_id: str) -> dict[str, Any] | None:
        """Retrieve question definition by ID."""
        return self._q_map.get(question_id)

    def next_question(
        self, encounter_id: str, answers: dict[str, Any]
    ) -> dict[str, Any] | None:
        """Return the next question dict for encounter_id given current answers dict.

        Returns None when intake is complete.
        """
        if not answers:
            return self._q_map.get(self._start_id)

        # Trace path starting from start_id
        curr_id: str | None = self._start_id
        visited: set[str] = set()

        while curr_id and curr_id not in visited:
            visited.add(curr_id)
            q_def = self._q_map.get(curr_id)
            if not q_def:
                break

            # If this question has NOT been answered yet, it's our next question!
            if curr_id not in answers:
                return q_def

            # Question has been answered -> evaluate next_map
            val = answers[curr_id]
            next_map = q_def.get("next_map", {})
            
            # Stringify value for key lookup
            val_str = str(val) if not isinstance(val, list) else (val[0] if val else "")
            
            if val_str in next_map:
                curr_id = next_map[val_str]
            else:
                curr_id = next_map.get("_default")

            if curr_id == "_END" or curr_id is None:
                return None

        # Fallback linear check for any remaining unanswered question in bank
        for q in self._questions:
            if q["id"] not in answers:
                return q

        return None

    def is_complete(self, answers: dict[str, Any]) -> bool:
        """Return True when the intake questionnaire is fully complete."""
        return self.next_question("encounter", answers) is None

    async def record_answer(
        self,
        encounter_id: str,
        question_id: str,
        value: Any,
        db: AsyncSession,
    ) -> Answer:
        """Persist a single answer to the database answers table."""
        q_def = self.get_question(question_id)
        q_text = q_def["text"] if q_def else question_id
        q_cat = q_def.get("category") if q_def else None

        enc_uuid = uuid.UUID(encounter_id)
        
        # Check if answer for this question already exists for this encounter
        stmt = select(Answer).where(
            Answer.encounter_id == enc_uuid, Answer.question_id == question_id
        )
        res = await db.execute(stmt)
        existing = res.scalar_one_or_none()

        if existing:
            existing.answer_value = value
            existing.question_text = q_text
            existing.category = q_cat
            answer_record = existing
        else:
            answer_record = Answer(
                encounter_id=enc_uuid,
                question_id=question_id,
                question_text=q_text,
                answer_value=value,
                category=q_cat,
            )
            db.add(answer_record)

        await db.commit()
        await db.refresh(answer_record)
        return answer_record

    async def get_answers_dict(
        self, encounter_id: str, db: AsyncSession
    ) -> dict[str, Any]:
        """Fetch all submitted answers for an encounter as a dictionary."""
        enc_uuid = uuid.UUID(encounter_id)
        stmt = select(Answer).where(Answer.encounter_id == enc_uuid)
        res = await db.execute(stmt)
        records = res.scalars().all()
        return {r.question_id: r.answer_value for r in records}
