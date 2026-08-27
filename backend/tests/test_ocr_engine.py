"""
Arogya Link — tests/test_ocr_engine.py
======================================
Phase 8 — Document OCR Integration Tests.
"""

from __future__ import annotations

import io
import pytest
from fastapi.testclient import TestClient

from app.main import create_app
from app.services.ocr_service import OCRService

app = create_app()
client = TestClient(app)
ocr_service = OCRService()


def test_ocr_service_process():
    """Verify OCRService processes image bytes correctly."""
    dummy_bytes = b"fake image bytes"
    res = ocr_service.process_prescription("test-enc-ocr", dummy_bytes)
    assert res["status"] == "success"
    assert res["encounter_id"] == "test-enc-ocr"
    assert len(res["detected_medications"]) >= 1


def test_ocr_api_endpoint():
    """Verify POST /ocr/process handles multipart file upload."""
    # 1. Create consented encounter
    r1 = client.post("/session", json={"full_name": "OCR Patient"})
    enc_id = r1.json()["encounter_id"]
    client.post("/consent", json={"encounter_id": enc_id, "consented": True})

    # 2. Upload fake image
    files = {"file": ("rx.jpg", io.BytesIO(b"fake image data"), "image/jpeg")}
    data = {"encounter_id": enc_id}

    r_ocr = client.post("/ocr/process", data=data, files=files)
    assert r_ocr.status_code == 200
    res = r_ocr.json()
    assert res["status"] == "success"
    assert res["encounter_id"] == enc_id
