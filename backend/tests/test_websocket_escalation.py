"""
Arogya Link — tests/test_websocket_escalation.py
=================================================
Phase 7 — Real-Time WebSocket Escalation Integration Tests.
"""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.escalation_service import EscalationService

app = create_app()
client = TestClient(app)
escalation_service = EscalationService()


import asyncio


def test_escalation_service_trigger():
    """Verify trigger_escalation generates valid alert payload."""
    res = asyncio.run(
        escalation_service.trigger_escalation(
            encounter_id="test-enc-uuid",
            triage_level="CRITICAL",
            red_flags=[{"name": "Chest Pain"}],
        )
    )
    assert res["type"] == "EMERGENCY_ALERT"
    assert res["triage_level"] == "CRITICAL"
    assert res["red_flags_count"] == 1


def test_websocket_connection_and_ping():
    """Verify WebSocket endpoint accepts connection and responds to ping."""
    with client.websocket_connect("/ws/notifications") as websocket:
        websocket.send_text("ping")
        data = websocket.receive_json()
        assert data["type"] == "pong"
