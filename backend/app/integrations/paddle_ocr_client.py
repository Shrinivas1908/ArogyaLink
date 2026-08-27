"""
Arogya Link — PaddleOCRClient (stub)
======================================
Phase: 8 — Document Upload & OCR

Responsibility
--------------
Wraps PaddleOCR (local inference) to extract text from uploaded patient
documents (scanned prescriptions, lab reports, discharge summaries).

Notes
-----
* PaddleOCR runs locally — no external API call, so no API key required.
* The client accepts image bytes or a file path and returns extracted text
  with per-line confidence scores.
* OCR runs asynchronously (via a background task queue); this client
  performs the blocking CPU-bound inference work.

Configuration (environment variables):
  PADDLEOCR_LANG  : language code for OCR model (default: ``"en"``)

Implementation target: Phase 8
"""

from __future__ import annotations

from typing import Any

__all__ = ["PaddleOCRClient"]


class PaddleOCRClient:
    """Wraps PaddleOCR local inference for document text extraction.

    All public methods raise :class:`NotImplementedError` until Phase 8.
    """

    def __init__(self, lang: str = "en") -> None:
        self._lang = lang
        # PaddleOCR model will be initialized here in Phase 8.

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 8
    # ------------------------------------------------------------------

    def extract(self, image_path: str) -> list[dict[str, Any]]:
        """Run OCR on *image_path* and return a list of line-level results.

        Each result contains: ``text``, ``confidence``, ``bbox``.

        :raises NotImplementedError: until Phase 8 is implemented.
        """
        raise NotImplementedError("PaddleOCRClient.extract — implement in Phase 8")

    def extract_bytes(self, image_bytes: bytes) -> list[dict[str, Any]]:
        """Run OCR on raw *image_bytes*.

        :raises NotImplementedError: until Phase 8 is implemented.
        """
        raise NotImplementedError("PaddleOCRClient.extract_bytes — implement in Phase 8")
