"""
Arogya Link — api/v1/health.py
================================
GET /health — returns {status, db, version} with a live SELECT 1 against PostgreSQL.

Per Phase 0 plan:
  Implement GET /health returning {status, db, version}, where db reflects
  a live SELECT 1 against PostgreSQL.
"""

from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Returns the application health status including a live database ping.

    Response:
        status  : "ok" | "degraded"
        db      : "ok" | "error"
        version : app version string
    """
    db_status = "error"
    try:
        await db.execute(text("SELECT 1"))
        db_status = "ok"
    except Exception:
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "db": db_status,
        "version": settings.app_version,
        "request_id": str(uuid.uuid4()),
    }
