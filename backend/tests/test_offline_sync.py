"""
Arogya Link — tests/test_offline_sync.py
=========================================
Phase 13 — Offline Storage & PWA Batch Sync Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app

app = create_app()
client = TestClient(app)


def test_sync_status_endpoint():
    """Verify GET /sync/status returns online sync status."""
    res = client.get("/sync/status")
    assert res.status_code == 200
    assert res.json()["status"] == "online"


def test_sync_push_endpoint():
    """Verify POST /sync/push processes batch offline intake records."""
    batch_data = [
        {
            "kiosk_id": "kiosk-rural-01",
            "triage_level": "ROUTINE",
            "patient": {
                "full_name": "Offline Synced Patient",
                "age": 38,
                "gender": "Female",
                "phone": "+91 99887 76655",
            },
        }
    ]

    res = client.post("/sync/push", json={"batch": batch_data})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["synced_count"] == 1
    assert len(data["synced_encounter_ids"]) == 1
