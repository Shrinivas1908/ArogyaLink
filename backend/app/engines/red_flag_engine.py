"""
Arogya Link — RedFlagEngine (stub)
====================================
Phase: 5 — Deterministic Red-Flag Engine

Responsibility
--------------
Evaluates a set of patient answers against the rule set defined in
``red_flags.json`` and produces a list of triggered red flags with severity
levels.  This engine is the **authoritative safety gate** for the system.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Red-flag severity is DETERMINISTIC and AUTHORITATIVE.
* Gemini (LLM) must NEVER set or override emergency priority.
* The same input must always produce the same output — no randomness.
* All rules must be backed by evidence (the specific answer that triggered them).

Implementation target: Phase 5
"""

from __future__ import annotations

import json
import pathlib
from typing import Any

__all__ = ["RedFlagEngine"]

_RED_FLAGS_PATH = pathlib.Path(__file__).parents[2] / "red_flags.json"


class RedFlagEngine:
    """Evaluates patient answers against deterministic red-flag rules.

    All public methods raise :class:`NotImplementedError` until Phase 5.
    """

    def __init__(self) -> None:
        with _RED_FLAGS_PATH.open(encoding="utf-8") as fh:
            self._rules: list[dict[str, Any]] = json.load(fh).get("rules", [])

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 5
    # ------------------------------------------------------------------

    def evaluate(self, answers: dict[str, Any]) -> list[dict[str, Any]]:
        """Evaluate *answers* against all red-flag rules.

        Returns a list of triggered red-flag objects, each containing at
        minimum: ``rule_id``, ``severity`` (critical | high | moderate),
        ``label``, and ``evidence`` (the answer key/value that triggered it).

        Returns an empty list when no rules are triggered.

        :raises NotImplementedError: until Phase 5 is implemented.
        """
        raise NotImplementedError("RedFlagEngine.evaluate — implement in Phase 5")

    def highest_severity(self, flags: list[dict[str, Any]]) -> str | None:
        """Return the highest severity string from *flags*, or ``None``.

        Priority order: critical > high > moderate.

        :raises NotImplementedError: until Phase 5 is implemented.
        """
        raise NotImplementedError("RedFlagEngine.highest_severity — implement in Phase 5")
