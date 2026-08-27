"""
Arogya Link — backend/app/integrations
=========================================
Integration clients wrap external APIs.  They handle authentication,
retry logic, and error normalization so that services only deal with
clean Python objects.

IMPORTANT: No API keys or credentials may live in this package.
           All secrets must come from environment variables / .env files.

Clients are populated phase-by-phase:
  Phase 10 → gemini_client       (Google Gemini API)
  Phase 8  → paddle_ocr_client   (PaddleOCR local/server)
  Phase 9  → bhashini_client     (Bhashini / AI4Bharat + Whisper fallback)
  Phase 15 → abdm_client         (ABDM / ABHA sandbox M2 APIs)
"""

from app.integrations.gemini_client import GeminiClient
from app.integrations.paddle_ocr_client import PaddleOCRClient
from app.integrations.bhashini_client import BhashiniClient
from app.integrations.abdm_client import ABDMClient

__all__ = [
    "GeminiClient",
    "PaddleOCRClient",
    "BhashiniClient",
    "ABDMClient",
]
