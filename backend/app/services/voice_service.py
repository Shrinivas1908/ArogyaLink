"""
Arogya Link — VoiceService (stub)
===================================
Phase: 9 — Voice Input

Responsibility
--------------
Accepts audio captured by the patient kiosk, sends it to the Bhashini /
AI4Bharat STT API (primary) or Whisper (fallback) via ``BhashiniClient``,
and returns a transcript that the patient must confirm before it is saved.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* Voice is OPTIONAL and ADDITIVE — intake must be completable by touch alone.
* Voice failure (network error, STT error, timeout) must NEVER block intake.
* The patient must EXPLICITLY CONFIRM the transcript before any answer is
  saved from voice input.
* The frontend must always show a touch fallback alongside voice capture.

Implementation target: Phase 9
"""

from __future__ import annotations

from typing import Any

__all__ = ["VoiceService"]


class VoiceService:
    """Manages STT transcription and transcript confirmation.

    All public methods raise :class:`NotImplementedError` until Phase 9.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 9
    # ------------------------------------------------------------------

    async def transcribe(self, audio_bytes: bytes, language_code: str = "hi") -> dict[str, Any]:
        """Transcribe *audio_bytes* using Bhashini primary / Whisper fallback.

        Returns: ``{"transcript": str, "confidence": float, "engine": str}``.

        Must not raise on STT failure — return a failure payload instead so
        the kiosk can offer touch fallback.

        :raises NotImplementedError: until Phase 9 is implemented.
        """
        raise NotImplementedError("VoiceService.transcribe — implement in Phase 9")

    async def confirm_transcript(
        self, encounter_id: str, question_id: str, confirmed_text: str
    ) -> None:
        """Persist a patient-confirmed transcript answer.

        Only called after the patient explicitly accepts the transcription.

        :raises NotImplementedError: until Phase 9 is implemented.
        """
        raise NotImplementedError("VoiceService.confirm_transcript — implement in Phase 9")
