"""
Arogya Link — tests/test_abha_login.py
======================================
Unit & integration tests for Synthetic ABHA ID + PIN authentication & session creation.
"""

from __future__ import annotations

import uuid
from unittest.mock import AsyncMock, MagicMock
from fastapi.testclient import TestClient
from app.main import create_app
from app.core.database import get_db

app = create_app()

# Mock DB Session for offline unit testing
async def override_get_db():
    mock_session = AsyncMock()
    mock_session.flush = AsyncMock()
    mock_session.commit = AsyncMock()
    mock_session.refresh = AsyncMock()

    # Create dummy scalar result
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_session.execute = AsyncMock(return_value=mock_result)

    yield mock_session

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_abha_pin_login_success():
    """POST /session/abha authenticates ABHA ID and initializes a patient session."""
    payload = {
        "abha_id": "91-4820-9182-3491",
        "pin": "1234",
        "kiosk_id": "kiosk-abha-01",
    }
    r = client.post("/session/abha", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert "encounter_id" in data
    assert "patient_id" in data
    assert data["status"] == "in_progress"
    assert data["abha_number"] == "91-4820-9182-3491"
    assert data["full_name"] in ["Aarav Sharma", "Ananya Sharma"]

    # Verify UUID format
    uuid.UUID(data["encounter_id"])
    uuid.UUID(data["patient_id"])
