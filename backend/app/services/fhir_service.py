"""
Arogya Link — FHIRService (stub)
==================================
Phase: 14 — History, Export & Testing

Responsibility
--------------
Assembles a completed encounter record into a FHIR-compatible JSON bundle
(FHIR R4 subset) that can be exported, stored, or pushed to ABDM when
ABHA integration is enabled (Phase 15).

Scope
-----
* The export format is FHIR-*compatible* JSON, not a certified FHIR server.
* The service does NOT push to any external system — that is ABHAService's job.
* The bundle must include: Patient, Encounter, Observation (answers),
  DocumentReference (OCR'd docs), Condition (red flags), and a Composition.

Implementation target: Phase 14
"""

from __future__ import annotations

from typing import Any

__all__ = ["FHIRService"]


class FHIRService:
    """Assembles FHIR-compatible JSON export bundles.

    All public methods raise :class:`NotImplementedError` until Phase 14.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 14
    # ------------------------------------------------------------------

    def build_bundle(self, encounter_id: str) -> dict[str, Any]:
        """Build and return a FHIR R4-compatible Bundle for *encounter_id*.

        :raises NotImplementedError: until Phase 14 is implemented.
        """
        raise NotImplementedError("FHIRService.build_bundle — implement in Phase 14")

    def export_json(self, encounter_id: str) -> str:
        """Return the FHIR bundle as a JSON string for download.

        :raises NotImplementedError: until Phase 14 is implemented.
        """
        raise NotImplementedError("FHIRService.export_json — implement in Phase 14")
