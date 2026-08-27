"""
Arogya Link — services/abha_service.py
======================================
Phase 12 — ABHA Digital Health Card & Linking Service.
"""

from __future__ import annotations

from typing import Any
from app.integrations.abdm_client import ABDMClient


class ABHAService:
    """Service for ABHA ID verification and ABDM record pushing."""

    def __init__(self) -> None:
        self.abdm_client = ABDMClient()

    def verify_and_link(self, abha_number: str, fhir_bundle: dict[str, Any]) -> dict[str, Any]:
        verification = self.abdm_client.verify_abha_number(abha_number)
        push_res = self.abdm_client.push_fhir_health_record(abha_number, fhir_bundle)

        return {
            "verification": verification,
            "abdm_link": push_res,
        }
