"""
Arogya Link — backend/app/engines
==================================
Engine modules contain deterministic, pure-Python business logic with no
external service dependencies.  Each engine is backed by a JSON configuration
file at the backend root and must be independently unit-testable.

Engines are populated phase-by-phase:
  Phase 4  → question_engine        (adaptive intake branching)
  Phase 5  → red_flag_engine        (deterministic safety rules)
  Phase 11 → contradiction_engine   (field-level conflict detection)
  Phase 13 → offline_sync_engine    (idempotent answer synchronization)

Import this package only after the JSON configuration files are present.
"""

from app.engines.question_engine import QuestionEngine
from app.engines.red_flag_engine import RedFlagEngine
from app.engines.contradiction_engine import ContradictionEngine
from app.engines.offline_sync_engine import OfflineSyncEngine

__all__ = [
    "QuestionEngine",
    "RedFlagEngine",
    "ContradictionEngine",
    "OfflineSyncEngine",
]
