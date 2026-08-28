"""
Arogya Link — services/ocr_service.py
======================================
Phase 8 — Document OCR & Medical Intelligence Service.
"""

from __future__ import annotations

from typing import Any
from app.integrations.paddle_ocr_client import PaddleOCRClient

# In-memory store for encounter OCR results
_ENCOUNTER_OCR_STORE: dict[str, dict[str, Any]] = {}


class OCRService:
    """Service wrapper for document OCR processing and encounter linkage."""

    def __init__(self) -> None:
        self.ocr_client = PaddleOCRClient()

    def process_prescription(
        self, encounter_id: str, image_bytes: bytes, filename: str = ""
    ) -> dict[str, Any]:
        """Process uploaded image or PDF document and store extraction against encounter."""
        result = self.ocr_client.process_image_bytes(image_bytes, filename=filename)
        result["encounter_id"] = encounter_id
        # Cache against encounter for summary synthesis and contradiction checking
        _ENCOUNTER_OCR_STORE[encounter_id] = result
        return result

    def get_encounter_ocr(self, encounter_id: str) -> dict[str, Any] | None:
        """Retrieve cached OCR result for encounter."""
        return _ENCOUNTER_OCR_STORE.get(encounter_id)
