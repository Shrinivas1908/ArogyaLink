"""
Arogya Link — models/base.py
==============================
SQLAlchemy declarative base shared by all models.
All model files import Base from here.
"""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared declarative base for all Arogya Link SQLAlchemy models."""
    pass
