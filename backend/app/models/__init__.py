"""
Arogya Link — app/models/__init__.py
Import all models here so Alembic autogenerate discovers them.
"""
from app.models.base import Base
from app.models.intake import Answer
from app.models.patient import Consent, Encounter, Patient
from app.models.staff import StaffProfile

__all__ = ["Base", "StaffProfile", "Patient", "Encounter", "Consent", "Answer"]
