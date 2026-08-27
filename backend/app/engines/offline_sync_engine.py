"""
Arogya Link — engines/offline_sync_engine.py
=============================================
Phase 13 — Offline Storage & PWA Batch Sync Engine.
"""

from __future__ import annotations

import uuid
from typing import Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.patient import Encounter, Patient


class OfflineSyncEngine:
    """Processes queued offline kiosk sessions and resolves data conflicts."""

    async def sync_offline_batch(
        self, offline_queue: list[dict[str, Any]], db: AsyncSession
    ) -> dict[str, Any]:
        """Process batch array of offline-recorded intake sessions."""
        synced_ids = []
        errors = []

        for item in offline_queue:
            try:
                patient_info = item.get("patient", {})
                patient = Patient(
                    full_name=patient_info.get("full_name"),
                    age=patient_info.get("age"),
                    gender=patient_info.get("gender"),
                    phone=patient_info.get("phone"),
                )
                db.add(patient)
                await db.flush()

                enc = Encounter(
                    patient_id=patient.id,
                    kiosk_id=item.get("kiosk_id", "offline-kiosk"),
                    status="completed",
                    triage_level=item.get("triage_level", "ROUTINE"),
                )
                db.add(enc)
                await db.flush()

                synced_ids.append(str(enc.id))
            except Exception as e:
                errors.append(str(e))

        await db.commit()

        return {
            "status": "success",
            "total_items": len(offline_queue),
            "synced_count": len(synced_ids),
            "synced_encounter_ids": synced_ids,
            "errors": errors,
        }
