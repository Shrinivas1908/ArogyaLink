"""
Arogya Link — api/v1/voice.py
=============================
Phase 9 — Multilingual Voice Input API Endpoints.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.services.voice_service import VoiceService

router = APIRouter(prefix="/voice", tags=["voice"])
voice_service = VoiceService()


@router.post("/transcribe")
async def transcribe_voice(
    encounter_id: str = Form(...),
    language: str = Form("hi"),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Transcribe voice audio in regional language (Hindi, Bengali, Tamil, etc.)."""
    await validate_consented_encounter(encounter_id, db)
    audio_bytes = await file.read()
    result = voice_service.transcribe_symptom_voice(encounter_id, audio_bytes, language=language)
    return result


@router.get("/languages")
async def get_supported_voice_languages() -> dict[str, Any]:
    """Retrieve list of supported Indian languages for voice intake."""
    return {
        "supported_languages": [
            {"code": "hi", "name": "Hindi (हिंदी)"},
            {"code": "bn", "name": "Bengali (বাংলা)"},
            {"code": "ta", "name": "Tamil (தமிழ்)"},
            {"code": "te", "name": "Telugu (తెలుగు)"},
            {"code": "mr", "name": "Marathi (मराठी)"},
            {"code": "gu", "name": "Gujarati (ગુજરાતી)"},
            {"code": "en", "name": "English"},
        ]
    }
