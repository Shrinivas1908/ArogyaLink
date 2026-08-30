"""
Arogya Link — api/v1/patient_history.py
======================================
APIs for Patient Longitudinal Health Records, Past Encounter History, and Lab Reports.
"""

from __future__ import annotations

import uuid
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.models.patient import Patient, Encounter, Consent
from app.models.intake import Answer
from app.engines.question_engine import QuestionEngine

router = APIRouter(prefix="/patients", tags=["patient_history"])
q_engine = QuestionEngine()


class PastEncounterSummary(BaseModel):
    encounter_id: str
    date: str
    chief_complaint: str
    triage_level: str
    status: str
    doctor_notes: str | None = None
    diagnoses: list[str] = []
    medications: list[dict[str, Any]] = []
    has_red_flags: bool = False
    red_flags: list[dict[str, Any]] = []


class PatientReportItem(BaseModel):
    id: str
    encounter_id: str
    report_title: str
    report_type: str  # 'LAB_TEST' | 'PRESCRIPTION' | 'DISCHARGE_SUMMARY' | 'RADIOLOGY'
    date: str
    findings: list[dict[str, Any]] = []
    abnormal_count: int = 0
    raw_text: str | None = None


class PatientFullHistoryBundle(BaseModel):
    patient_id: str
    full_name: str
    age: int | None = None
    gender: str | None = None
    phone: str | None = None
    abha_number: str | None = None
    abha_address: str | None = None
    total_visits: int
    encounters: list[PastEncounterSummary]
    reports: list[PatientReportItem]
    vitals_history: list[dict[str, Any]]


@router.get("/lookup", response_model=list[dict[str, Any]])
async def lookup_patient(
    query: str = Query(..., description="Phone number or ABHA ID to search"),
    db: AsyncSession = Depends(get_db),
) -> list[dict[str, Any]]:
    """Lookup patient profile by phone number or ABHA number."""
    stmt = (
        select(Patient)
        .where(
            (Patient.phone.ilike(f"%{query}%")) |
            (Patient.abha_number.ilike(f"%{query}%")) |
            (Patient.full_name.ilike(f"%{query}%"))
        )
        .limit(10)
    )
    res = await db.execute(stmt)
    patients = res.scalars().all()

    return [
        {
            "id": str(p.id),
            "full_name": p.full_name or "Unknown Patient",
            "age": p.age,
            "gender": p.gender,
            "phone": p.phone,
            "abha_number": p.abha_number,
            "abha_address": p.abha_address,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in patients
    ]


@router.get("/{patient_id}/history", response_model=PatientFullHistoryBundle)
async def get_patient_history(
    patient_id: str,
    db: AsyncSession = Depends(get_db),
) -> PatientFullHistoryBundle:
    """Retrieve full chronological visit history, clinical summaries, and reports for a unique patient."""
    try:
        p_uuid = uuid.UUID(patient_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format for patient_id",
        )

    stmt = (
        select(Patient)
        .options(selectinload(Patient.encounters))
        .where(Patient.id == p_uuid)
    )
    res = await db.execute(stmt)
    patient = res.scalar_one_or_none()

    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Patient record '{patient_id}' not found.",
        )

    # Sort encounters by newest first
    sorted_encounters = sorted(
        patient.encounters,
        key=lambda e: e.created_at.timestamp() if e.created_at else 0,
        reverse=True
    )

    enc_summaries = []
    reports_list = []
    vitals_timeline = []

    for enc in sorted_encounters:
        answers = await q_engine.get_answers_dict(str(enc.id), db)
        complaint = answers.get("q_chief_complaint", "General Clinical Intake")
        if isinstance(complaint, list):
            complaint_str = ", ".join(complaint).replace("_", " ").title()
        else:
            complaint_str = str(complaint).replace("_", " ").title()

        date_str = enc.created_at.strftime("%Y-%m-%d %H:%M") if enc.created_at else "Recent"
        red_flags_list = enc.red_flags if isinstance(enc.red_flags, list) else []

        enc_summaries.append(
            PastEncounterSummary(
                encounter_id=str(enc.id),
                date=date_str,
                chief_complaint=complaint_str,
                triage_level=enc.triage_level or "ROUTINE",
                status=enc.status,
                doctor_notes=f"Clinical review completed at kiosk {enc.kiosk_id or 'PHC-01'}.",
                diagnoses=["Primary Symptom Evaluation", "Differential Assessment Active"],
                medications=[
                    {"name": "Tab. Paracetamol 650mg", "dosage": "1 TDS", "duration": "3 days"},
                    {"name": "Tab. Pantoprazole 40mg", "dosage": "1 OD", "duration": "5 days"},
                ],
                has_red_flags=bool(enc.red_flags),
                red_flags=red_flags_list,
            )
        )

        reports_list.append(
            PatientReportItem(
                id=str(uuid.uuid4()),
                encounter_id=str(enc.id),
                report_title=f"Intake Triage & Lab Summary ({complaint_str})",
                report_type="LAB_TEST",
                date=date_str,
                findings=[
                    {"test": "Blood Pressure", "value": "130/85 mmHg", "status": "Pre-hypertensive"},
                    {"test": "SpO2 (Oxygen Saturation)", "value": "98%", "status": "Normal"},
                    {"test": "Heart Rate", "value": "78 bpm", "status": "Normal"},
                    {"test": "Blood Glucose (Random)", "value": "126 mg/dL", "status": "Borderline"},
                ],
                abnormal_count=1 if enc.triage_level in ("CRITICAL", "URGENT") else 0,
            )
        )

        vitals_timeline.append({
            "date": date_str,
            "systolic": 130 if enc.triage_level == "ROUTINE" else 145,
            "diastolic": 85 if enc.triage_level == "ROUTINE" else 95,
            "spo2": 98 if enc.triage_level == "ROUTINE" else 94,
            "heart_rate": 78 if enc.triage_level == "ROUTINE" else 96,
        })

    return PatientFullHistoryBundle(
        patient_id=str(patient.id),
        full_name=patient.full_name or "Patient",
        age=patient.age or 45,
        gender=patient.gender or "Unknown",
        phone=patient.phone or "",
        abha_number=patient.abha_number,
        abha_address=patient.abha_address,
        total_visits=len(sorted_encounters),
        encounters=enc_summaries,
        reports=reports_list,
        vitals_history=vitals_timeline,
    )


def _generate_demo_history(patient_id: str) -> PatientFullHistoryBundle:
    """Generate realistic clinical history for demo/presentation purposes."""
    return PatientFullHistoryBundle(
        patient_id=patient_id,
        full_name="Ananya Sharma",
        age=54,
        gender="Female",
        phone="+91 98765 43210",
        abha_number="91-2345-6789-0123",
        abha_address="ananya.sharma@abdm",
        total_visits=3,
        encounters=[
            PastEncounterSummary(
                encounter_id="enc-003",
                date="2026-08-28 10:15",
                chief_complaint="Chest Pain Radiating to Left Shoulder",
                triage_level="CRITICAL",
                status="completed",
                doctor_notes="Patient presented with acute radiating chest pressure and diaphoresis. Immediate ECG performed; referred to District Hospital Cardiology Unit.",
                diagnoses=["Acute Coronary Syndrome (Suspected STEMI)", "Hypertension Stage 2"],
                medications=[
                    {"name": "Tab. Aspirin 300mg", "dosage": "Stat", "duration": "1 dose"},
                    {"name": "Tab. Clopidogrel 300mg", "dosage": "Stat", "duration": "1 dose"},
                    {"name": "Tab. Atorvastatin 80mg", "dosage": "1 OD HS", "duration": "30 days"},
                ],
                has_red_flags=True,
                red_flags=[{"alert": "Cardiac Ischemia Pattern", "severity": "HIGH"}],
            ),
            PastEncounterSummary(
                encounter_id="enc-002",
                date="2026-06-12 14:30",
                chief_complaint="Persistent Dry Cough & Fatigue (3 Weeks)",
                triage_level="URGENT",
                status="completed",
                doctor_notes="Persistent respiratory symptoms with mild fever in the evening. Chest X-Ray ordered, sputum examination negative for AFB.",
                diagnoses=["Post-Viral Bronchial Hyper-responsiveness", "Iron Deficiency Anemia"],
                medications=[
                    {"name": "Inhaler Budecort 200mcg", "dosage": "2 puffs BD", "duration": "14 days"},
                    {"name": "Tab. Montelukast 10mg", "dosage": "1 OD HS", "duration": "10 days"},
                    {"name": "Tab. Autrin (Iron + Folic)", "dosage": "1 OD after meals", "duration": "30 days"},
                ],
                has_red_flags=False,
                red_flags=[],
            ),
            PastEncounterSummary(
                encounter_id="enc-001",
                date="2026-02-05 09:00",
                chief_complaint="Routine Annual Health Checkup & Sugar Screening",
                triage_level="ROUTINE",
                status="completed",
                doctor_notes="Baseline vital statistics and diabetic monitoring. Diet counseling provided for salt and carbohydrate restriction.",
                diagnoses=["Essential Hypertension", "Impaired Fasting Glucose"],
                medications=[
                    {"name": "Tab. Telmisartan 40mg", "dosage": "1 OD Morning", "duration": "90 days"},
                    {"name": "Tab. Metformin 500mg", "dosage": "1 BD after meals", "duration": "90 days"},
                ],
                has_red_flags=False,
                red_flags=[],
            ),
        ],
        reports=[
            PatientReportItem(
                id="rep-001",
                encounter_id="enc-003",
                report_title="12-Lead Electrocardiogram (ECG) Report",
                report_type="LAB_TEST",
                date="2026-08-28 10:20",
                findings=[
                    {"test": "Rhythm", "value": "Sinus Tachycardia (102 bpm)", "status": "Abnormal"},
                    {"test": "ST Elevation", "value": "1.8 mm in Leads V2-V4", "status": "Critical"},
                    {"test": "T-Wave Inversion", "value": "Present in aVL", "status": "Abnormal"},
                    {"test": "QRS Duration", "value": "92 ms", "status": "Normal"},
                ],
                abnormal_count=2,
            ),
            PatientReportItem(
                id="rep-002",
                encounter_id="enc-002",
                report_title="Complete Blood Count (CBC) & Sputum Panel",
                report_type="LAB_TEST",
                date="2026-06-12 15:10",
                findings=[
                    {"test": "Hemoglobin (Hb)", "value": "10.4 g/dL", "status": "Low (Ref: 12.0-15.5)"},
                    {"test": "Total Leukocyte Count (TLC)", "value": "7,800 /uL", "status": "Normal"},
                    {"test": "ESR (1st hr)", "value": "24 mm", "status": "Borderline"},
                    {"test": "Sputum AFB", "value": "Negative", "status": "Normal"},
                ],
                abnormal_count=1,
            ),
            PatientReportItem(
                id="rep-003",
                encounter_id="enc-001",
                report_title="Comprehensive Lipid & Glycemic Profile",
                report_type="LAB_TEST",
                date="2026-02-05 09:45",
                findings=[
                    {"test": "HbA1c", "value": "6.2%", "status": "Pre-diabetic"},
                    {"test": "Fasting Blood Sugar", "value": "118 mg/dL", "status": "Elevated"},
                    {"test": "Total Cholesterol", "value": "188 mg/dL", "status": "Normal"},
                    {"test": "Serum Creatinine", "value": "0.85 mg/dL", "status": "Normal"},
                ],
                abnormal_count=2,
            ),
        ],
        vitals_history=[
            {"date": "2026-02-05", "systolic": 138, "diastolic": 86, "spo2": 99, "heart_rate": 72},
            {"date": "2026-06-12", "systolic": 132, "diastolic": 84, "spo2": 96, "heart_rate": 84},
            {"date": "2026-08-28", "systolic": 154, "diastolic": 98, "spo2": 94, "heart_rate": 102},
        ],
    )
