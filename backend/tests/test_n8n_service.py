"""
Arogya Link — tests/test_n8n_service.py
=======================================
Unit & Integration Tests for n8n Webhook Notifications.
"""

from __future__ import annotations

import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.n8n_service import N8nNotificationService

app = create_app()
client = TestClient(app)


def test_n8n_status_endpoint():
    """Verify GET /notifications/n8n/status returns configuration and endpoint."""
    from app.core.config import settings
    settings.n8n_webhook_url = "https://mock-n8n.cloud/webhook/arogyasetu-notifications"
    response = client.get("/notifications/n8n/status")
    assert response.status_code == 200
    data = response.json()
    assert "webhook_url" in data
    assert "enabled" in data
    assert "arogyasetu-notifications" in data["webhook_url"]


def test_n8n_service_payload_formatting():
    """Verify N8nNotificationService formats event payloads correctly."""
    service = N8nNotificationService()

    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"message": "Workflow was started"}
        mock_post.return_value = mock_response

        res = asyncio.run(
            service.send_emergency_escalation(
                encounter_id="test-encounter-12345",
                triage_level="CRITICAL",
                red_flags=[{"name": "Severe Chest Pain"}],
                patient_info={"full_name": "Ramesh Patil"},
            )
        )

        assert res["status"] == "DELIVERED"
        assert res["event"] == "EMERGENCY_ESCALATION"
        assert res["payload"]["priority"] == "CRITICAL"
        assert res["payload"]["data"]["encounter_id"] == "test-encounter-12345"
        assert res["payload"]["data"]["patient"]["full_name"] == "Ramesh Patil"


def test_n8n_service_resilience_on_error():
    """Verify service catches network exceptions without raising an unhandled error."""
    service = N8nNotificationService()

    with patch("httpx.AsyncClient.post", side_effect=Exception("Network Timeout")):
        res = asyncio.run(
            service.send_patient_checkin(
                encounter_id="enc-999",
                patient_name="Sunita Deshmukh",
                triage_level="ROUTINE",
            )
        )
        assert res["status"] == "ERROR"
        assert "Network Timeout" in res["error"]


def test_n8n_custom_dispatch_endpoint():
    """Verify POST /notifications/n8n/dispatch accepts valid requests."""
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"message": "Workflow was started"}
        mock_post.return_value = mock_response

        response = client.post(
            "/notifications/n8n/dispatch",
            json={
                "event_type": "CLINICAL_FOLLOWUP",
                "data": {"patient_id": "p-100", "notes": "Followup required"},
                "priority": "HIGH",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
        assert data["result"]["status"] == "DELIVERED"


def test_n8n_escalate_endpoint():
    """Verify POST /notifications/n8n/escalate manual trigger."""
    with patch("httpx.AsyncClient.post", new_callable=AsyncMock) as mock_post:
        mock_response = MagicMock()
        mock_response.is_success = True
        mock_response.status_code = 200
        mock_response.json.return_value = {"message": "Workflow was started"}
        mock_post.return_value = mock_response

        response = client.post(
            "/notifications/n8n/escalate",
            json={
                "encounter_id": "test-enc-uuid-1",
                "triage_level": "CRITICAL",
                "red_flags": [{"name": "Shortness of breath"}],
                "patient_name": "Kavita Rao",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"
