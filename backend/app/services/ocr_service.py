"""
Arogya Link — OCRService (stub)
=================================
Phase: 8 — Document Upload & OCR

Responsibility
--------------
Receives an uploaded document file path/bytes, runs PaddleOCR via
``PaddleOCRClient``, and persists the extracted text along with an OCR status
flag (pending | processing | complete | failed).

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* OCR output is EVIDENCE, not ground truth — the doctor must verify it.
* OCR must be completed and independently verified BEFORE Gemini consumes
  OCR output (Phase Gate Principle).
* OCR processing is asynchronous; the API must return a task/document ID
  immediately and update status when complete.

Implementation target: Phase 8
"""

from __future__ import annotations

from typing import Any

__all__ = ["OCRService"]


class OCRService:
    """Manages document OCR using PaddleOCR.

    All public methods raise :class:`NotImplementedError` until Phase 8.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 8
    # ------------------------------------------------------------------

    async def enqueue(self, encounter_id: str, file_path: str, mime_type: str) -> str:
        """Queue an OCR job for *file_path* and return a ``document_id``.

        :raises NotImplementedError: until Phase 8 is implemented.
        """
        raise NotImplementedError("OCRService.enqueue — implement in Phase 8")

    async def get_result(self, document_id: str) -> dict[str, Any]:
        """Return the OCR result for *document_id*.

        Result contains: ``status``, ``extracted_text``, ``confidence``,
        ``completed_at``.

        :raises NotImplementedError: until Phase 8 is implemented.
        """
        raise NotImplementedError("OCRService.get_result — implement in Phase 8")
