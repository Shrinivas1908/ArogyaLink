"""
Arogya Link — ABDMClient (stub)
==================================
Phase: 15 — ABHA / ABDM Integration

Responsibility
--------------
Wraps the ABDM sandbox / M2 APIs for ABHA health ID verification and
consent-based FHIR record push to the patient's health locker.

Safety constraints (non-negotiable, from Rules.md):
  * ABHA linking is OPTIONAL — never block a normal walk-in encounter.
  * Store ONLY the ABHA reference number — NEVER the Aadhaar number.
  * Patient consent for FHIR push must be explicitly recorded separately.
  * Use ABDM sandbox URLs in development; never call production endpoints
    without explicit environment configuration.

Configuration (environment variables — never hardcode):
  ABDM_BASE_URL        : ABDM API base URL (sandbox or production)
  ABDM_CLIENT_ID       : M2 client ID
  ABDM_CLIENT_SECRET   : M2 client secret
  ABDM_ENV             : ``"sandbox"`` | ``"production"``

Implementation target: Phase 15
"""

from __future__ import annotations

from typing import Any

__all__ = ["ABDMClient"]


class ABDMClient:
    """Wraps ABDM M2 APIs for ABHA verification and FHIR push.

    All public methods raise :class:`NotImplementedError` until Phase 15.
    """

    # ------------------------------------------------------------------
    # Public API — stubbed for Phase 15
    # ------------------------------------------------------------------

    async def verify_abha(self, abha_reference: str) -> dict[str, Any]:
        """Verify *abha_reference* via ABDM APIs.

        Returns verification status and masked patient metadata.
        Does NOT return Aadhaar number.

        :raises NotImplementedError: until Phase 15 is implemented.
        """
        raise NotImplementedError("ABDMClient.verify_abha — implement in Phase 15")

    async def push_fhir_bundle(
        self, abha_reference: str, fhir_bundle: dict[str, Any]
    ) -> dict[str, Any]:
        """Push *fhir_bundle* to the patient's ABHA health locker.

        Requires patient consent already recorded.

        :raises NotImplementedError: until Phase 15 is implemented.
        """
        raise NotImplementedError("ABDMClient.push_fhir_bundle — implement in Phase 15")
