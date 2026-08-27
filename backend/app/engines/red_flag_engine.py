"""
Arogya Link — RedFlagEngine
============================
Phase: 5 — Deterministic Red-Flag Engine

Evaluates patient intake answers against red_flags.json.
Determines encounter triage level (CRITICAL, URGENT, ROUTINE) with zero AI hallucination risk.
"""

from __future__ import annotations

import json
import pathlib
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Encounter

__all__ = ["RedFlagEngine"]

_RED_FLAGS_PATH = pathlib.Path(__file__).parents[2] / "red_flags.json"


class RedFlagEngine:
    """Evaluates intake answers deterministically against red_flags.json."""

    def __init__(self) -> None:
        with _RED_FLAGS_PATH.open(encoding="utf-8") as fh:
            data = json.load(fh)
        self._rules: list[dict[str, Any]] = data.get("rules", [])

    def evaluate_answers(self, answers: dict[str, Any]) -> dict[str, Any]:
        """Scan submitted answers and evaluate triggered red flags & triage level.

        Returns:
            {
                "triage_level": "CRITICAL" | "URGENT" | "ROUTINE",
                "has_red_flags": bool,
                "triggered_flags": list[dict],
                "requires_immediate_escalation": bool
            }
        """
        chief_complaints = answers.get("q_chief_complaint", [])
        if isinstance(chief_complaints, str):
            chief_complaints = [chief_complaints]

        associated = answers.get("q_associated_symptoms", [])
        if isinstance(associated, str):
            associated = [associated]

        triggered: list[dict[str, Any]] = []
        max_severity = "ROUTINE"

        for rule in self._rules:
            triggers = rule.get("symptom_triggers", [])
            assoc_triggers = rule.get("associated_triggers", [])

            # Check if all chief complaint triggers match
            matched_trigger = all(t in chief_complaints for t in triggers) if triggers else False

            if matched_trigger:
                if assoc_triggers:
                    # Must match associated triggers if defined
                    if any(a in associated for a in assoc_triggers):
                        triggered.append(rule)
                else:
                    triggered.append(rule)

        if triggered:
            severities = [r.get("severity", "ROUTINE").upper() for r in triggered]
            if "CRITICAL" in severities:
                max_severity = "CRITICAL"
            elif "HIGH" in severities or "URGENT" in severities:
                max_severity = "URGENT"

        return {
            "triage_level": max_severity,
            "has_red_flags": len(triggered) > 0,
            "triggered_flags": triggered,
            "requires_immediate_escalation": max_severity == "CRITICAL",
        }

    async def save_evaluation(
        self, encounter_id: str, evaluation: dict[str, Any], db: AsyncSession
    ) -> Encounter | None:
        """Update encounter record in database with triage level and red flags."""
        enc_uuid = uuid.UUID(encounter_id)
        stmt = select(Encounter).where(Encounter.id == enc_uuid)
        res = await db.execute(stmt)
        enc = res.scalar_one_or_none()

        if enc:
            enc.triage_level = evaluation["triage_level"]
            enc.red_flags = evaluation["triggered_flags"]
            enc.triaged_at = datetime.now(timezone.utc)
            await db.commit()
            await db.refresh(enc)

        return enc
