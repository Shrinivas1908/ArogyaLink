"""
Arogya Link — app/main.py
===========================
FastAPI application factory.

Per Phase 0 plan:
  - Use an app-factory pattern — create_app() returning a configured FastAPI
    instance — so the same app can be imported by uvicorn and the test suite.
  - Add CORSMiddleware restricted to kiosk and dashboard origins only.
  - Add centralized exception handlers returning one consistent JSON error
    envelope {error_code, message, request_id}.
  - Mount GET /health endpoint.
"""

from __future__ import annotations

import uuid

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.v1 import audit as audit_router
from app.api.v1 import auth_otp as auth_otp_router
from app.api.v1 import ayush as ayush_router
from app.api.v1 import doctor_queue as doctor_queue_router
from app.api.v1 import fhir as fhir_router
from app.api.v1 import health as health_router
from app.api.v1 import intake as intake_router
from app.api.v1 import ocr as ocr_router
from app.api.v1 import offline_sync as offline_sync_router
from app.api.v1 import patient_history as patient_history_router
from app.api.v1 import reminders as reminders_router
from app.api.v1 import session as session_router
from app.api.v1 import staff as staff_router
from app.api.v1 import summary as summary_router
from app.api.v1 import triage as triage_router
from app.api.v1 import voice as voice_router
from app.api.v1 import ws_notifications as ws_router
from app.core.config import settings
from app.core.database import engine
from app.models.base import Base
import app.models  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to initialize database tables on startup."""
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as e:
        print(f"[ArogyaLink] Database initialization notice: {e}")
    yield


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""

    app = FastAPI(
        title="ArogyaSetu API",
        version=settings.app_version,
        description="Patient kiosk and clinical review platform — SIH 2026",
        docs_url="/docs" if settings.app_env == "development" else None,
        redoc_url="/redoc" if settings.app_env == "development" else None,
        lifespan=lifespan,
    )

    # ── CORS — restricted to kiosk + dashboard origins only ────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ── Centralized exception handlers ───────────────────────────────────
    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error_code": f"HTTP_{exc.status_code}",
                "message": exc.detail,
                "request_id": str(uuid.uuid4()),
            },
        )

    @app.exception_handler(ValidationError)
    async def validation_exception_handler(request: Request, exc: ValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "error_code": "VALIDATION_ERROR",
                "message": exc.errors(),
                "request_id": str(uuid.uuid4()),
            },
        )

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        return JSONResponse(
            status_code=500,
            content={
                "error_code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred.",
                "request_id": str(uuid.uuid4()),
            },
        )

    # ── Routers ──────────────────────────────────────────────────────────
    app.include_router(health_router.router)
    app.include_router(auth_otp_router.router)
    app.include_router(staff_router.router)
    app.include_router(session_router.router)
    app.include_router(intake_router.router)
    app.include_router(triage_router.router)
    app.include_router(doctor_queue_router.router)
    app.include_router(ws_router.router)
    app.include_router(ocr_router.router)
    app.include_router(voice_router.router)
    app.include_router(summary_router.router)
    app.include_router(audit_router.router)
    app.include_router(fhir_router.router)
    app.include_router(offline_sync_router.router)
    app.include_router(ayush_router.router)
    app.include_router(reminders_router.router)
    app.include_router(patient_history_router.router)

    return app


# Uvicorn entrypoint: uvicorn app.main:app --reload
app = create_app()
