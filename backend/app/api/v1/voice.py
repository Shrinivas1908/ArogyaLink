"""
Arogya Link — api/v1/voice.py
=============================
Phase 9 — Multilingual Voice Input API Endpoints.

Endpoints:
  POST /voice/transcribe  — Transcribe audio in a regional Indian language.
  GET  /voice/languages   — List supported voice languages.
"""

from __future__ import annotations

import base64
from typing import Any

from fastapi import APIRouter, File, Form, UploadFile
from pydantic import BaseModel, Field

from app.services.voice_service import VoiceService

router = APIRouter(prefix="/voice", tags=["voice"])
voice_service = VoiceService()


class VoiceTranscribeRequest(BaseModel):
    """JSON body schema for voice transcription. All fields optional."""
    encounter_id: str | None = Field(default=None, description="Encounter UUID (optional, for audit logging)")
    language: str | None = Field(default="hi", description="Target language code e.g. 'hi', 'bn', 'ta'")
    source_language: str | None = Field(default=None, description="Alias for language")
    audio_base64: str | None = Field(default=None, description="Base64-encoded audio bytes")


@router.post("/transcribe")
async def transcribe_voice(
    body: VoiceTranscribeRequest | None = None,
    encounter_id: str | None = Form(None),
    language: str = Form("hi"),
    file: UploadFile | None = File(None),
) -> dict[str, Any]:
    """
    Transcribe voice audio in a regional Indian language.

    Accepts either:
    - JSON body with audio_base64 + language
    - Multipart form with file upload + language

    Note: encounter_id is purely optional — used for audit logging only.
    No session validation is enforced here so the kiosk can call this freely.
    """
    # Resolve language
    target_lang = (
        (body.source_language or body.language) if body else None
    ) or language or "hi"
    target_lang = target_lang.lower().split("-")[0]  # normalise 'hi-IN' → 'hi'

    # Resolve encounter_id (optional, for logging only)
    target_enc_id = (body.encounter_id if body else None) or encounter_id or "anonymous"

    # Resolve audio bytes
    audio_bytes: bytes = b""
    if body and body.audio_base64:
        try:
            audio_bytes = base64.b64decode(body.audio_base64)
        except Exception:
            audio_bytes = b""
    elif file:
        audio_bytes = await file.read()

    result = voice_service.transcribe_symptom_voice(
        target_enc_id, audio_bytes, language=target_lang
    )
    return result


@router.get("/languages")
async def get_supported_voice_languages() -> dict[str, Any]:
    """Retrieve the list of supported Indian languages for voice intake."""
    return {
        "supported_languages": [
            {"code": "hi", "name": "Hindi",    "native": "हिंदी",   "speech_code": "hi-IN"},
            {"code": "bn", "name": "Bengali",  "native": "বাংলা",   "speech_code": "bn-IN"},
            {"code": "ta", "name": "Tamil",    "native": "தமிழ்",   "speech_code": "ta-IN"},
            {"code": "te", "name": "Telugu",   "native": "తెలుగు",  "speech_code": "te-IN"},
            {"code": "mr", "name": "Marathi",  "native": "मराठी",   "speech_code": "mr-IN"},
            {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "speech_code": "gu-IN"},
            {"code": "kn", "name": "Kannada",  "native": "ಕನ್ನಡ",   "speech_code": "kn-IN"},
            {"code": "ml", "name": "Malayalam","native": "മലയാളം",  "speech_code": "ml-IN"},
            {"code": "en", "name": "English",  "native": "English",  "speech_code": "en-IN"},
        ]
    }
