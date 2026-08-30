"""
Arogya Link — models/patient.py
=================================
SQLAlchemy models for Patient identity, Kiosk Encounter, and Consent events.
"""

from __future__ import annotations

import uuid
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, ForeignKey, func, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Patient(Base):
    __tablename__ = "patients"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    abha_number: Mapped[str | None] = mapped_column(String(50), nullable=True, index=True)
    abha_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    encounters: Mapped[list[Encounter]] = relationship("Encounter", back_populates="patient")


class Encounter(Base):
    __tablename__ = "encounters"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    status: Mapped[str] = mapped_column(String(50), default="in_progress", nullable=False)
    kiosk_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Triage and Red-Flag Fields (Phase 5)
    triage_level: Mapped[str] = mapped_column(String(50), default="ROUTINE", nullable=False, index=True)
    red_flags: Mapped[dict | list | None] = mapped_column(JSON, nullable=True)
    triaged_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    patient: Mapped[Patient] = relationship("Patient", back_populates="encounters")
    consent: Mapped[Consent | None] = relationship("Consent", back_populates="encounter", uselist=False)


class Consent(Base):
    __tablename__ = "consent"

    id: Mapped[uuid.UUID] = mapped_column(Uuid(as_uuid=True), primary_key=True, default=uuid.uuid4)
    encounter_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True), ForeignKey("encounters.id", ondelete="CASCADE"), nullable=False, unique=True
    )
    consented: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    consent_version: Mapped[str] = mapped_column(String(50), default="v1.0", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    encounter: Mapped[Encounter] = relationship("Encounter", back_populates="consent")
