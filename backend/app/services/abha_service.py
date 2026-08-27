"""
Arogya Link — ABHAService (stub)
==================================
Phase: 15 — ABHA / ABDM Integration

Responsibility
--------------
Manages optional linking of an encounter to an ABHA health ID via ABDM
sandbox / M2 APIs.  On successful linking, the FHIR bundle (from FHIRService)
can be pushed to the patient's ABHA-linked health locker with their consent.

Safety constraints (non-negotiable, from Rules.md)
---------------------------------------------------
* ABHA linking is OPTIONAL — it must NOT block a normal walk-in encounter.
* Only the ABHA reference number is stored, NEVER the Aadhaar number.
* Patient consent for FHIR push must be explicit and separately recorded.
* This service depends on FHIRService (Phase 14) being complete first.

Dependency order: implement AFTER Phase 14 (FHIR export) is complete.

Implementation target: Phase 15
"""

from __future__ import annotations

from typing import Any

__all__ = ["ABHAService"]


class ABHAService:
    """Manages ABHA linking and ABDM FHIR push operations.

    All public methods raise :class:`NotImplementedError` until Phase 15.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 15
    # ------------------------------------------------------------------

    async def link_abha(self, encounter_id: str, abha_reference: str) -> dict[str, Any]:
        """Link *encounter_id* to *abha_reference* via ABDM APIs.

        Returns the link record.  Does NOT store Aadhaar number.

        :raises NotImplementedError: until Phase 15 is implemented.
        """
        raise NotImplementedError("ABHAService.link_abha — implement in Phase 15")

    async def push_fhir(self, encounter_id: str, abha_reference: str) -> dict[str, Any]:
        """Push the encounter FHIR bundle to the patient's ABHA health locker.

        Requires explicit patient consent recorded separately.

        :raises NotImplementedError: until Phase 15 is implemented.
        """
        raise NotImplementedError("ABHAService.push_fhir — implement in Phase 15")
