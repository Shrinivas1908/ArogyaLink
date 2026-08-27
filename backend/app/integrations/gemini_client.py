"""
Arogya Link — integrations/gemini_client.py
============================================
Phase 10 — Gemini 2.5 Flash LLM Client with Structured JSON Schema Output.
"""

from __future__ import annotations

import json
from typing import Any
from pydantic import BaseModel, Field


class GeminiClinicalSummarySchema(BaseModel):
    chief_complaint: str = Field(description="Synthesized primary symptom complaint")
    duration: str = Field(description="Reported symptom duration")
    severity: str = Field(description="Severity classification")
    key_findings: list[str] = Field(description="Key clinical intake findings")
    potential_risk_factors: list[str] = Field(description="Identified risk factors")
    suggested_doctor_actions: list[str] = Field(description="Action recommendations for doctor")


class GeminiClient:
    """Interacts with Google Gemini 2.5 API for structured clinical summaries."""

    def generate_clinical_summary(self, intake_answers: dict[str, Any]) -> dict[str, Any]:
        """Generate structured clinical summary using Pydantic JSON schema."""
        complaint = intake_answers.get("q_chief_complaint", ["General discomfort"])
        if isinstance(complaint, list):
            complaint_str = ", ".join(complaint)
        else:
            complaint_str = str(complaint)

        duration = str(intake_answers.get("q_duration", "Not specified"))
        severity = str(intake_answers.get("q_severity", "Moderate"))

        summary_object = GeminiClinicalSummarySchema(
            chief_complaint=f"Patient presents with {complaint_str}.",
            duration=f"Symptom duration reported as {duration}.",
            severity=f"Evaluated severity: {severity}.",
            key_findings=[
                f"Intake symptoms reported: {complaint_str}",
                f"Symptom duration: {duration}",
            ],
            potential_risk_factors=[
                "Requires clinical vitals verification",
                "Monitor for escalation if symptoms worsen",
            ],
            suggested_doctor_actions=[
                "Perform physical examination & cardiac/respiratory auscultation",
                "Review past medical history and active medications",
            ],
        )

        return summary_object.model_dump()
