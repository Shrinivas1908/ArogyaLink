"""
Arogya Link — services/ocr_service.py
======================================
Phase 8 — Document OCR Service.
"""

from __future__ import annotations

from typing import Any
from app.integrations.paddle_ocr_client import PaddleOCRClient


class OCRService:
    """Service wrapper for document OCR processing."""

    def __init__(self) -> None:
        self.ocr_client = PaddleOCRClient()

    def process_prescription(self, encounter_id: str, image_bytes: bytes) -> dict[str, Any]:
        result = self.ocr_client.process_image_bytes(image_bytes)
        result["encounter_id"] = encounter_id
        return result
