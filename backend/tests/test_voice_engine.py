"""
Arogya Link — tests/test_voice_engine.py
========================================
Phase 9 — Multilingual Voice Input Integration Tests.
"""

from __future__ import annotations

import io
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.voice_service import VoiceService

app = create_app()
client = TestClient(app)
voice_service = VoiceService()


def test_voice_service_transcribe():
    """Verify VoiceService transcribes regional audio."""
    res = voice_service.transcribe_symptom_voice("enc-voice-1", b"fake audio", language="hi")
    assert res["status"] == "success"
    assert res["source_language"] == "hi"
    assert "translated_english" in res


def test_voice_api_transcribe_and_languages():
    """Verify GET /voice/languages and POST /voice/transcribe."""
    # 1. GET /voice/languages
    r_langs = client.get("/voice/languages")
    assert r_langs.status_code == 200
    assert len(r_langs.json()["supported_languages"]) >= 5

    # 2. POST /voice/transcribe
    r1 = client.post("/session", json={"full_name": "Voice Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    files = {"file": ("audio.wav", io.BytesIO(b"audio bytes"), "audio/wav")}
    data = {"encounter_id": enc_id, "language": "hi"}

    r_trans = client.post("/voice/transcribe", data=data, files=files)
    assert r_trans.status_code == 200
    assert r_trans.json()["status"] == "success"
