"""
Arogya Link — services/voice_service.py
========================================
Phase 9 — Multilingual Voice Input Service.
"""

from __future__ import annotations

from typing import Any
from app.integrations.bhashini_client import BhashiniClient


class VoiceService:
    """Service wrapper for Bhashini voice transcription."""

    def __init__(self) -> None:
        self.bhashini_client = BhashiniClient()

    def transcribe_symptom_voice(
        self, encounter_id: str, audio_bytes: bytes, language: str = "hi"
    ) -> dict[str, Any]:
        result = self.bhashini_client.transcribe_audio_bytes(audio_bytes, source_language=language)
        result["encounter_id"] = encounter_id
        return result
