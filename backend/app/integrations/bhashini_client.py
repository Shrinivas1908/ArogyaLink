"""
Arogya Link — BhashiniClient (stub)
=====================================
Phase: 9 — Voice Input

Responsibility
--------------
Wraps the Bhashini / AI4Bharat speech-to-text API (primary) with an automatic
fallback to OpenAI Whisper when the primary STT is unavailable.

Fallback strategy:
  1. Attempt Bhashini STT with *language_code*.
  2. On timeout / error → retry once.
  3. If retry fails → invoke Whisper fallback.
  4. Always return a result dict (never raise to the caller); include an
     ``engine`` field so the service layer can log which path was used.

Safety constraints (inherited from VoiceService / Rules.md):
  * Must NEVER block the intake workflow.  Failures must be surfaced as a
    failed-transcript payload, not an exception.

Configuration (environment variables — never hardcode):
  BHASHINI_API_KEY     : Bhashini / AI4Bharat API key
  BHASHINI_USER_ID     : Bhashini user ID
  OPENAI_API_KEY       : OpenAI Whisper fallback key (optional)
  VOICE_TIMEOUT_SECS   : HTTP timeout for STT request (default: 10)

Implementation target: Phase 9
"""

from __future__ import annotations

from typing import Any

__all__ = ["BhashiniClient"]


class BhashiniClient:
    """Bhashini primary STT with Whisper fallback.

    All public methods raise :class:`NotImplementedError` until Phase 9.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 9
    # ------------------------------------------------------------------

    async def transcribe(
        self, audio_bytes: bytes, language_code: str = "hi"
    ) -> dict[str, Any]:
        """Transcribe *audio_bytes* in *language_code*.

        Returns ``{"transcript": str, "confidence": float, "engine": str,
        "success": bool}``.

        On STT failure returns ``{"transcript": "", "success": False,
        "engine": "none", "error": str}``.

        :raises NotImplementedError: until Phase 9 is implemented.
        """
        raise NotImplementedError("BhashiniClient.transcribe — implement in Phase 9")
