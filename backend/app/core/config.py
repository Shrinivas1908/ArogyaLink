"""
Arogya Link — core/config.py
==============================
Pydantic v2 Settings — reads from .env file.
All secrets come from environment variables; nothing is hard-coded.

Per Phase 0 plan:
  Reads DATABASE_URL, SUPABASE_URL, SUPABASE_JWT_AUD, GEMINI_API_KEY
  and related secrets from .env — never hard-coded.
"""

from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── App ──────────────────────────────────────────────────────────
    app_env: str = "development"
    app_version: str = "0.1.0"

    # ── Database (PostgreSQL) ─────────────────────────────────────────
    database_url: str = "postgresql+asyncpg://arogya:arogya_pass@localhost:5432/arogya_link"

    # ── CORS ─────────────────────────────────────────────────────────
    cors_origins: str = "http://localhost:5173,http://localhost:5174,http://localhost:5175"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # ── Supabase Auth (Phase 1+) ──────────────────────────────────────
    supabase_url: str = ""
    supabase_jwt_aud: str = "authenticated"
    supabase_anon_key: str = ""
    supabase_service_role_key: str = ""

    # ── AI / Integrations (Phase 8+) ─────────────────────────────────
    gemini_api_key: str = ""
    groq_api_key: str = ""
    bhashini_api_key: str = ""
    bhashini_user_id: str = ""
    openai_api_key: str = ""
    abdm_base_url: str = "https://sandbox.abdm.gov.in"
    abdm_client_id: str = ""
    abdm_client_secret: str = ""
    abdm_env: str = "sandbox"
    paddleocr_lang: str = "en"
    ocr_api_url: str = ""  # Cloud OCR API Endpoint (e.g. https://api.ocr.space/parse/image or custom endpoint)
    ocr_api_key: str = ""  # Cloud OCR API Key
    voice_timeout_secs: int = 10
    fast2sms_api_key: str = ""


# Single shared instance — import this everywhere
settings = Settings()
