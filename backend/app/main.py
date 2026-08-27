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

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.api.v1 import health as health_router
from app.api.v1 import session as session_router
from app.api.v1 import staff as staff_router
from app.core.config import settings


def create_app() -> FastAPI:
    """Create and configure the FastAPI application instance."""

    app = FastAPI(
        title="Arogya Link API",
        version=settings.app_version,
        description="Patient kiosk and clinical review platform — SIH 2026",
        docs_url="/docs" if settings.app_env == "development" else None,
        redoc_url="/redoc" if settings.app_env == "development" else None,
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
    app.include_router(staff_router.router)
    app.include_router(session_router.router)

    return app


# Uvicorn entrypoint: uvicorn app.main:app --reload
app = create_app()
