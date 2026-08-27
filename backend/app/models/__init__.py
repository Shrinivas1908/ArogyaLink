"""
Arogya Link — app/models/__init__.py
Import all models here so Alembic autogenerate discovers them.
"""
from app.models.base import Base
from app.models.staff import StaffProfile

__all__ = ["Base", "StaffProfile"]
