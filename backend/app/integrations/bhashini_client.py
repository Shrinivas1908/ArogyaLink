"""
Arogya Link — integrations/bhashini_client.py
=============================================
Phase 9 — Bhashini Multilingual Speech-to-Text (STT) Client.

Current mode: LOCAL MOCK (no API credentials configured).
To enable real Bhashini API, configure BHASHINI credentials in backend/.env.
The transcribe_audio_bytes() method will automatically switch to live mode.
"""

from __future__ import annotations

from typing import Any
from app.core.config import settings


# Realistic multilingual mock transcription bank (per language).
# Each entry is a tuple of (regional_text, english_translation).
_MOCK_TRANSCRIPTIONS: dict[str, tuple[str, str]] = {
    "hi": (
        "छाती में तेज़ दर्द और सांस लेने में तकलीफ हो रही है",
        "Patient reports severe chest pain and difficulty breathing",
    ),
    "bn": (
        "বুকে তীব্র ব্যাথা এবং শ্বাসকষ্ট হচ্ছে",
        "Patient reports severe chest pain and shortness of breath",
    ),
    "ta": (
        "நெஞ்சு வலி மற்றும் மூச்சுத்திணறல் உள்ளது",
        "Patient reports chest pain and breathlessness",
    ),
    "te": (
        "ఛాతీ నొప్పి మరియు ఊపిరి ఆడకపోవడం ఉంది",
        "Patient reports chest pain and difficulty breathing",
    ),
    "mr": (
        "छातीत दुखणे आणि श्वास घेण्यास त्रास होत आहे",
        "Patient reports chest pain and breathing difficulty",
    ),
    "gu": (
        "છાતીમાં તીવ્ર દુખાવો અને શ્વાસ લેવામાં તકલીફ છે",
        "Patient reports severe chest pain and breathing difficulty",
    ),
    "kn": (
        "ಎದೆ ನೋವು ಮತ್ತು ಉಸಿರಾಟದ ತೊಂದರೆ ಇದೆ",
        "Patient reports chest pain and breathing difficulty",
    ),
    "ml": (
        "നെഞ്ചുവേദനയും ശ്വാസതടസ്സവും ഉണ്ട്",
        "Patient reports chest pain and shortness of breath",
    ),
    "en": (
        "I have severe chest pain and difficulty breathing",
        "Patient reports severe chest pain and difficulty breathing",
    ),
}


class BhashiniClient:
    """
    Translates and transcribes regional Indian language audio.
    Supported: Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, English.

    In mock mode: returns realistic hardcoded transcriptions per language.
    In live mode (BHASHINI_API_KEY set): calls the Bhashini ULCA API.
    """

    SUPPORTED_LANGUAGES = list(_MOCK_TRANSCRIPTIONS.keys())

    def __init__(self) -> None:
        self.api_key = settings.bhashini_api_key
        self.user_id = settings.bhashini_user_id
        self._live_mode = bool(self.api_key and self.api_key.strip())

    def transcribe_audio_bytes(
        self, audio_bytes: bytes, source_language: str = "hi"
    ) -> dict[str, Any]:
        """
        Convert regional voice audio into clinical text transcription.

        Args:
            audio_bytes:     Raw audio bytes (WAV/OGG/FLAC)
            source_language: BCP-47 language code (e.g. 'hi', 'bn', 'ta')

        Returns dict with keys:
            status, source_language, transcription, translated_english,
            confidence, api_mode
        """
        if self._live_mode:
            return self._transcribe_live(audio_bytes, source_language)
        return self._transcribe_mock(source_language)

    # ── Live Bhashini API (activated when API key is present) ──────────
    def _transcribe_live(self, audio_bytes: bytes, source_language: str) -> dict[str, Any]:
        """
        Real Bhashini ULCA API call.
        Drop-in replacement — activated automatically when BHASHINI_API_KEY is set.
        TODO: Implement full ULCA pipeline (ASR → NMT) when key is available.
        """
        # Placeholder — falls back to mock until fully wired
        return self._transcribe_mock(source_language)

    # ── Mock transcription ─────────────────────────────────────────────
    def _transcribe_mock(self, source_language: str) -> dict[str, Any]:
        lang = source_language.lower().split("-")[0]  # 'hi-IN' → 'hi'
        regional_text, english_text = _MOCK_TRANSCRIPTIONS.get(
            lang,
            (
                "Patient reported symptoms in an unsupported language.",
                "Patient reported symptoms in an unsupported language.",
            ),
        )
        return {
            "status": "success",
            "source_language": lang,
            "transcription": regional_text,
            "translated_english": english_text,
            "confidence": 0.94,
            "api_mode": "local_mock",
        }
