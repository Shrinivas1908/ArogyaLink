"""
Arogya Link — integrations/gemini_client.py
============================================
Phase 10 — Gemini 3.6/3.7 Flash & Groq LLM Client with Structured JSON Schema Output.
Features:
- Gemini 3.6/3.7 Flash clinical synthesis with high precision
- Groq Llama-3.3-70b support
- Deterministic Pydantic clinical safety baseline
- Easy-to-understand Executive Summary & Patient-Friendly explanation
- Full Multimodal OCR & Prescription linkage
"""

from __future__ import annotations

import json
import logging
from typing import Any
import httpx
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)

GEMINI_SUMMARY_MODELS = [
    "gemini-3.6-flash",
    "gemini-3.7-flash",
]


class DifferentialDiagnosis(BaseModel):
    condition: str = Field(description="Name of suspected clinical condition")
    likelihood: str = Field(description="High / Moderate / Low")
    rationale: str = Field(description="Clear, easy-to-understand clinical rationale")


class GeminiClinicalSummarySchema(BaseModel):
    quick_summary: str = Field(
        description="1-2 sentence executive snapshot for rapid doctor review"
    )
    patient_friendly_summary: str = Field(
        description="Clear plain-language explanation for patient and family"
    )
    chief_complaint: str = Field(description="Synthesized primary symptom complaint")
    duration: str = Field(description="Reported symptom duration")
    severity: str = Field(description="Severity classification (Critical / Urgent / Routine)")
    history_of_present_illness: str = Field(
        description="Concise 2-sentence clinical HPI narrative"
    )
    key_findings: list[str] = Field(description="Key clinical intake findings and vital flags")
    active_medications_and_labs: list[str] = Field(
        default_factory=list,
        description="Active medications or lab findings identified from intake and OCR documents",
    )
    potential_risk_factors: list[str] = Field(
        description="Identified risk factors and safety alerts"
    )
    differential_diagnoses: list[DifferentialDiagnosis] = Field(
        description="Top differential diagnoses with likelihood and reasoning"
    )
    recommended_vitals_and_labs: list[str] = Field(
        description="Priority investigations & vitals check required immediately"
    )
    suggested_doctor_actions: list[str] = Field(
        description="Step-by-step actionable recommendations for doctor"
    )


class GeminiClient:
    """Interacts with Google Gemini & Groq LLM APIs for structured, easy-to-understand clinical summaries."""

    def __init__(self) -> None:
        self.gemini_api_key = settings.gemini_api_key
        self.groq_api_key = settings.groq_api_key

    def generate_clinical_summary(
        self,
        intake_answers: dict[str, Any],
        ocr_text: str | None = None,
        ocr_medications: list[dict[str, Any]] | None = None,
        language: str = "en",
    ) -> dict[str, Any]:
        """Generate high-precision structured clinical summary optimized for easy human understanding."""
        complaint = intake_answers.get("q_chief_complaint", ["General discomfort"])
        if isinstance(complaint, list):
            complaint_str = ", ".join(complaint).replace("_", " ").title()
        else:
            complaint_str = str(complaint).replace("_", " ").title()

        duration = str(intake_answers.get("q_duration", "Acute / recent onset")).replace("_", " ")
        severity = str(intake_answers.get("q_severity", "Moderate to Severe")).replace("_", " ").title()

        ocr_context = ""
        if ocr_text:
            ocr_context += f"\n- Uploaded Prescription / Lab Document Raw Text: {ocr_text[:600]}"
        if ocr_medications:
            med_names = [f"{m.get('name')} {m.get('dosage', '')} ({m.get('frequency', '')})" for m in ocr_medications]
            ocr_context += f"\n- Extracted Active Medications from Rx: {', '.join(med_names)}"

        lang_name = {
            "hi": "Hindi (हिंदी)",
            "bn": "Bengali (বাংলা)",
            "ta": "Tamil (தமிழ்)",
            "te": "Telugu (తెలుగు)",
            "mr": "Marathi (मराठी)",
            "gu": "Gujarati (ગુજરાતી)",
            "kn": "Kannada (ಕನ್ನಡ)",
        }.get(language.lower(), "English")

        lang_instruction = ""
        if language.lower() != "en":
            lang_instruction = (
                f"\nIMPORTANT: The patient's chosen language is {lang_name}.\n"
                f"Please write the 'patient_friendly_summary' in fluent, clear, and reassuring {lang_name}.\n"
                f"For 'quick_summary', provide the concise English medical snapshot followed by a 1-sentence {lang_name} translation."
            )

        # 1. Primary: Google Gemini Flash (3.6 / 3.7 / flash-latest)
        if self.gemini_api_key and self.gemini_api_key.strip():
            prompt_text = (
                f"You are an expert AI Clinical Decision-Support Specialist.\n"
                f"Analyze the following patient intake and uploaded prescription data and produce a structured JSON summary:\n"
                f"- Chief Complaint: {complaint_str}\n"
                f"- Duration: {duration}\n"
                f"- Severity: {severity}\n"
                f"- Intake Answers: {json.dumps(intake_answers)}\n"
                f"{ocr_context}\n"
                f"{lang_instruction}\n\n"
                f"Required JSON keys:\n"
                f"- quick_summary (1-2 sentence high-yield snapshot for doctor at a glance)\n"
                f"- patient_friendly_summary (simple, reassuring explanation in plain language for patient/family)\n"
                f"- chief_complaint\n"
                f"- duration\n"
                f"- severity (Critical / Urgent / Routine)\n"
                f"- history_of_present_illness (2-sentence clinical HPI narrative)\n"
                f"- key_findings (array of concise findings)\n"
                f"- active_medications_and_labs (array of detected Rx meds and lab results)\n"
                f"- potential_risk_factors (array of safety alerts)\n"
                f"- differential_diagnoses (array of objects: condition, likelihood [High/Moderate/Low], rationale)\n"
                f"- recommended_vitals_and_labs (array of immediate investigations)\n"
                f"- suggested_doctor_actions (array of step-by-step clinical actions)\n\n"
                f"Return ONLY valid JSON."
            )

            for model_name in GEMINI_SUMMARY_MODELS:
                try:
                    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={self.gemini_api_key.strip()}"
                    payload = {
                        "contents": [{"parts": [{"text": prompt_text}]}],
                        "generationConfig": {"response_mime_type": "application/json", "temperature": 0.1},
                    }
                    with httpx.Client(timeout=30.0) as client:
                        resp = client.post(url, json=payload)
                        if resp.status_code == 200:
                            data = resp.json()
                            clean_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                            return json.loads(clean_text)
                except Exception as model_err:
                    logger.warning(f"Summary model {model_name} failed: {model_err}")
                    continue

        # 2. Secondary: Groq Llama-3.3-70b (if key is configured and valid)
        if self.groq_api_key and self.groq_api_key.strip():
            try:
                system_prompt = (
                    "You are an expert AI Clinical Decision-Support Specialist. "
                    "Output a strictly valid JSON object matching: quick_summary, patient_friendly_summary, "
                    "chief_complaint, duration, severity, history_of_present_illness, key_findings, "
                    "active_medications_and_labs, potential_risk_factors, differential_diagnoses, "
                    "recommended_vitals_and_labs, suggested_doctor_actions."
                )
                user_prompt = f"Complaint: {complaint_str}, Duration: {duration}, Severity: {severity}. Data: {json.dumps(intake_answers)}. {ocr_context}"
                headers = {"Authorization": f"Bearer {self.groq_api_key.strip()}", "Content-Type": "application/json"}
                payload = {
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
                    "response_format": {"type": "json_object"},
                    "temperature": 0.1,
                }
                with httpx.Client(timeout=10.0) as client:
                    resp = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        return json.loads(data["choices"][0]["message"]["content"])
            except Exception as e:
                logger.warning(f"Groq summary generation failed: {e}")

        # 3. Deterministic Safety Baseline Fallback
        is_chest = "chest" in complaint_str.lower() or "heart" in complaint_str.lower()
        is_fever = "fever" in complaint_str.lower() or "chills" in complaint_str.lower() or "malaria" in (ocr_context.lower())

        if is_fever:
            diff_diagnoses = [
                DifferentialDiagnosis(
                    condition="Malaria / Vector-Borne Febrile Episode",
                    likelihood="High",
                    rationale=f"Reported fever with chills for {duration}; classic intermittent febrile pattern.",
                ),
                DifferentialDiagnosis(
                    condition="Acute Viral Infection / Dengue Syndrome",
                    likelihood="Moderate",
                    rationale="High prevalence differential for acute onset fever with chills and headache.",
                ),
                DifferentialDiagnosis(
                    condition="Bacterial Upper/Lower Respiratory Tract Infection",
                    likelihood="Low",
                    rationale="Consider if focal chest or throat symptoms arise.",
                ),
            ]
            quick_sum = f"Patient presents with fever and chills of {duration} duration; urgent blood smear for malaria & CBC indicated."
            patient_sum = (
                "You have a fever with chills. Our medical team will check your temperature and perform a quick "
                "blood test to check for infections (like Malaria) and prescribe medications to relieve your discomfort."
            )
            vitals_labs = [
                "Peripheral Blood Smear (PBS) & Rapid Malaria Antigen (Pf/Pv)",
                "Complete Blood Count (CBC) with Platelet Count",
                "Digital Temperature & Pulse Oximetry (SpO2)",
            ]
            doctor_actions = [
                "Review peripheral smear / RDT for Plasmodium species",
                "Check hydration status, vitals, and liver/spleen enlargement",
                "Review prescribed antiemetic and antimalarial medications",
            ]
        elif is_chest:
            diff_diagnoses = [
                DifferentialDiagnosis(
                    condition="Acute Coronary Syndrome (ACS / STEMI)",
                    likelihood="High",
                    rationale="Reported acute onset severe chest pressure with radiating discomfort.",
                ),
                DifferentialDiagnosis(
                    condition="Gastroesophageal Reflux Spasm / Peptic Spasm",
                    likelihood="Moderate",
                    rationale="Common differential presentation with similar retrosternal sensation.",
                ),
            ]
            quick_sum = f"Patient presents with acute {complaint_str.lower()} of {duration} duration; urgent cardiac evaluation indicated."
            patient_sum = (
                "You are experiencing acute chest discomfort that requires an immediate checkup by our doctor "
                "along with an ECG and vital signs check to ensure your heart is safe and healthy."
            )
            vitals_labs = [
                "12-Lead Electrocardiogram (ECG) within 10 mins",
                "Continuous Cardiac & SpO2 Monitoring",
                "Point-of-Care Cardiac Troponin I/T",
            ]
            doctor_actions = [
                "Review 12-lead ECG for ST elevation immediately",
                "Auscultate heart and lung sounds",
                "Initiate emergency protocol if indicated",
            ]
        else:
            diff_diagnoses = [
                DifferentialDiagnosis(
                    condition=f"Acute {complaint_str} Episode",
                    likelihood="High",
                    rationale=f"Reported symptoms with duration {duration}.",
                ),
            ]
            quick_sum = f"Patient presents with {complaint_str.lower()} for {duration}; clinical evaluation recommended."
            patient_sum = f"You are visiting for {complaint_str.lower()}. Our doctor will examine you shortly."
            vitals_labs = ["Baseline Vital Signs Check (BP, Pulse, SpO2)"]
            doctor_actions = ["Conduct physical examination and review medication history"]

        active_meds = []
        if ocr_medications:
            for m in ocr_medications:
                active_meds.append(f"{m.get('name')} {m.get('dosage', '')} - {m.get('frequency', '')}")

        summary_object = GeminiClinicalSummarySchema(
            quick_summary=quick_sum,
            patient_friendly_summary=patient_sum,
            chief_complaint=f"Patient reports {complaint_str}.",
            duration=f"Duration: {duration}.",
            severity=f"Triage status: {severity}.",
            history_of_present_illness=f"Patient initiated intake reporting {complaint_str} persisting for {duration}. Evaluated at triage severity {severity}.",
            key_findings=[
                f"Primary Reported Complaint: {complaint_str}",
                f"Symptom Duration: {duration}",
                f"Triage Severity Level: {severity}",
            ],
            active_medications_and_labs=active_meds,
            potential_risk_factors=[
                "Monitor for symptom escalation or fever spikes",
                "Verify vital signs (BP, Pulse, SpO2, Temperature)",
            ],
            differential_diagnoses=diff_diagnoses,
            recommended_vitals_and_labs=vitals_labs,
            suggested_doctor_actions=doctor_actions,
        )

        return summary_object.model_dump()
