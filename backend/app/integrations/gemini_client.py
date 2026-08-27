"""
Arogya Link — GeminiClient (stub)
====================================
Phase: 10 — Gemini Clinical Summary

Responsibility
--------------
Low-level HTTP wrapper around the Google Gemini API (google-generativeai SDK).
Handles authentication via ``GEMINI_API_KEY`` environment variable, request
building, response parsing, and error normalization.

Configuration (environment variables — never hardcode):
  GEMINI_API_KEY  : Google AI Studio or Vertex AI API key

Safety constraints (inherited from LLMService / Rules.md):
  * Must NOT set emergency severity — that is RedFlagEngine's domain.
  * Returns raw Gemini response dict; schema validation happens in LLMService.
  * Model name and generation parameters come from config, not hardcoded.

Implementation target: Phase 10
"""

from __future__ import annotations

import os
from typing import Any

__all__ = ["GeminiClient"]

# Placeholder — loaded from environment at runtime (Phase 10).
_API_KEY_ENV = "GEMINI_API_KEY"


class GeminiClient:
    """Thin wrapper around the Google Gemini generative AI API.

    All public methods raise :class:`NotImplementedError` until Phase 10.
    """

    def __init__(self) -> None:
        # Validate that the env var exists at startup so the error is obvious.
        # Key is NOT read here to avoid accidental logging.
        self._api_key_set: bool = bool(os.environ.get(_API_KEY_ENV))

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 10
    # ------------------------------------------------------------------

    async def generate(
        self,
        prompt: str,
        model: str = "gemini-1.5-pro",
        temperature: float = 0.2,
    ) -> dict[str, Any]:
        """Send *prompt* to Gemini and return the raw response dict.

        Low temperature enforces structured, reproducible outputs.

        :raises NotImplementedError: until Phase 10 is implemented.
        """
        raise NotImplementedError("GeminiClient.generate — implement in Phase 10")
