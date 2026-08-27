"""
Arogya Link — LLMService (stub)
=================================
Phase: 10 — Gemini Clinical Summary

Responsibility
--------------
The single Gemini integration point.  Accepts a controlled, normalized set of
structured inputs (touch answers, confirmed voice answers, OCR-verified fields,
triggered red flags) and calls the Gemini API via ``GeminiClient`` to produce a
schema-validated draft clinical summary.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Gemini must NEVER set or override emergency priority — that is
  RedFlagEngine's authoritative output.
* The Gemini response must be validated against ``ClinicalSummarySchema``
  (Pydantic) before being stored or displayed.
* The generated summary is a DRAFT; the doctor must review and approve it.
* Doctor approval is an explicit action logged via AuditService.
* LLM service must not be called unless OCR and deterministic intake are
  complete (Phase Gate Principle from Phases.md).

Implementation target: Phase 10
"""

from __future__ import annotations

from typing import Any

__all__ = ["LLMService"]


class LLMService:
    """Orchestrates Gemini API calls and validates the response schema.

    All public methods raise :class:`NotImplementedError` until Phase 10.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 10
    # ------------------------------------------------------------------

    async def generate_summary(self, encounter_payload: dict[str, Any]) -> dict[str, Any]:
        """Call Gemini with *encounter_payload* and return a validated draft.

        *encounter_payload* must be a fully normalized structure containing
        touch answers, confirmed voice answers, OCR-verified fields, and the
        red-flag evaluation result.

        Returns a dict conforming to ``ClinicalSummarySchema``.

        :raises NotImplementedError: until Phase 10 is implemented.
        """
        raise NotImplementedError("LLMService.generate_summary — implement in Phase 10")

    async def validate_response(self, raw_response: dict[str, Any]) -> dict[str, Any]:
        """Validate *raw_response* against ``ClinicalSummarySchema``.

        Raises ``ValidationError`` if the schema is not satisfied.

        :raises NotImplementedError: until Phase 10 is implemented.
        """
        raise NotImplementedError("LLMService.validate_response — implement in Phase 10")
