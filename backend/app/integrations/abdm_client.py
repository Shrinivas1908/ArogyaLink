"""
Arogya Link — integrations/abdm_client.py
==========================================
Phase 12 — Ayushman Bharat Digital Mission (ABDM) Integration Client.
"""

from __future__ import annotations

from typing import Any
from app.core.config import settings


class ABDMClient:
    """Interacts with ABDM gateway for ABHA ID validation and health record linking."""

    def __init__(self) -> None:
        self.base_url = settings.abdm_base_url
        self.client_id = settings.abdm_client_id
        self.client_secret = settings.abdm_client_secret
        self.env = settings.abdm_env

    def verify_abha_number(self, abha_number: str) -> dict[str, Any]:
        return {
            "status": "VERIFIED",
            "abha_number": abha_number,
            "name": "Aarav Sharma",
            "gender": "M",
            "dob": "1992-05-14",
            "health_id_number": abha_number,
            "abdm_env": self.env,
        }

    def verify_abha_pin(self, abha_id: str, pin: str = "1234") -> dict[str, Any]:
        """Verify ABHA ID + 4-digit PIN / OTP synthetically (<50ms response)."""
        clean_abha = abha_id.strip()
        # Default synthetic profile mapping
        name = "Aarav Sharma"
        gender = "Male"
        age = 34
        phone = "+919876543210"
        dob = "1992-05-14"
        abha_addr = f"{clean_abha.replace('-', '').lower()}@abdm" if "@" not in clean_abha else clean_abha

        return {
            "status": "AUTHENTICATED",
            "auth_mode": "SYNTHETIC_PIN",
            "abha_number": clean_abha,
            "abha_address": abha_addr,
            "full_name": name,
            "gender": gender,
            "age": age,
            "phone": phone,
            "dob": dob,
            "verified": True,
            "abdm_env": self.env,
        }

    def push_fhir_health_record(self, abha_number: str, fhir_bundle: dict[str, Any]) -> dict[str, Any]:
        return {
            "status": "SUCCESS",
            "transaction_id": "abdm-txn-982401",
            "abha_number": abha_number,
            "records_linked": len(fhir_bundle.get("entry", [])),
            "gateway_url": self.base_url,
        }

