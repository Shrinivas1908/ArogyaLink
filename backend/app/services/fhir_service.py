"""
Arogya Link — services/fhir_service.py
======================================
Phase 12 — FHIR R4 Bundle Export Service.
"""

from __future__ import annotations

import uuid
from typing import Any


class FHIRService:
    """Generates standard HL7 FHIR R4 JSON bundles for clinical encounters."""

    def build_encounter_fhir_bundle(
        self, encounter_id: str, patient_name: str | None, answers: dict[str, Any]
    ) -> dict[str, Any]:
        """Construct FHIR R4 Bundle containing Patient, Encounter, and Observation resources."""
        patient_resource = {
            "resourceType": "Patient",
            "id": f"pat-{encounter_id[:8]}",
            "name": [{"text": patient_name or "Anonymous Patient"}],
        }

        encounter_resource = {
            "resourceType": "Encounter",
            "id": f"enc-{encounter_id[:8]}",
            "status": "finished",
            "class": {"code": "AMB", "display": "ambulatory"},
            "subject": {"reference": f"Patient/pat-{encounter_id[:8]}"},
        }

        observations = []
        for q_id, val in answers.items():
            observations.append({
                "resourceType": "Observation",
                "id": str(uuid.uuid4())[:8],
                "status": "final",
                "code": {"text": q_id},
                "valueString": str(val),
                "subject": {"reference": f"Patient/pat-{encounter_id[:8]}"},
            })

        bundle_entries = [
            {"resource": patient_resource},
            {"resource": encounter_resource},
        ] + [{"resource": obs} for obs in observations]

        return {
            "resourceType": "Bundle",
            "id": f"bundle-{encounter_id[:8]}",
            "type": "document",
            "entry": bundle_entries,
        }
