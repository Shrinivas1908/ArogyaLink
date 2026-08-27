"""
Arogya Link — api/v1/offline_sync.py
====================================
Phase 13 — Offline Storage & PWA Batch Sync APIs.
"""

from __future__ import annotations

from typing import Any
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.engines.offline_sync_engine import OfflineSyncEngine

router = APIRouter(prefix="/sync", tags=["offline_sync"])
sync_engine = OfflineSyncEngine()


class SyncPushRequest(BaseModel):
    batch: list[dict[str, Any]]


@router.post("/push")
async def push_offline_batch(
    body: SyncPushRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Sync offline-queued kiosk intake records to primary server database."""
    res = await sync_engine.sync_offline_batch(body.batch, db)
    return res


@router.get("/status")
async def sync_engine_status() -> dict[str, Any]:
    """Check PWA offline sync engine health and status."""
    return {"status": "online", "sync_engine": "active", "protocol": "IndexedDB-PWA-Sync-v1"}
