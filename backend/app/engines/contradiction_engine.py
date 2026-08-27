"""
Arogya Link — ContradictionEngine (stub)
==========================================
Phase: 11 — Contradiction Detection

Responsibility
--------------
Performs deterministic field-level comparison across multiple data sources
(touch answers, voice-confirmed transcript answers, OCR-extracted values) and
produces a list of contradiction records where the same clinical field contains
conflicting values.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Contradiction detection flags conflicts; it does NOT auto-resolve them.
* The doctor is the only authority who can resolve a contradiction.
* Both conflicting values must be shown side-by-side in the UI.
* This engine must NEVER call an external AI service.

Implementation target: Phase 11
"""

from __future__ import annotations

from typing import Any

__all__ = ["ContradictionEngine"]


class ContradictionEngine:
    """Detects field-level contradictions across intake data sources.

    All public methods raise :class:`NotImplementedError` until Phase 11.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 11
    # ------------------------------------------------------------------

    def detect(
        self,
        touch_answers: dict[str, Any],
        voice_answers: dict[str, Any],
        ocr_fields: dict[str, Any],
    ) -> list[dict[str, Any]]:
        """Compare *touch_answers*, *voice_answers*, and *ocr_fields*.

        Returns a list of contradiction objects.  Each object contains:
        ``field``, ``source_a``, ``value_a``, ``source_b``, ``value_b``.

        Returns an empty list when no contradictions are found.

        :raises NotImplementedError: until Phase 11 is implemented.
        """
        raise NotImplementedError("ContradictionEngine.detect — implement in Phase 11")
