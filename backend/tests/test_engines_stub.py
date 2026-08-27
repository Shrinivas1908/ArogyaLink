"""
Arogya Link — Person 3 Phase 0: Stub Import Verification Tests
================================================================
These tests verify that all engine, service, and integration stubs:
  1. Can be imported without error.
  2. Raise NotImplementedError when called (not some other error).
  3. Expose the expected class names.
  4. JSON configuration files (questions.json, ayush_questions.json,
     red_flags.json) are valid JSON and have the expected top-level keys.

These tests must ALL PASS before the Phase 0 integration checkpoint.
Run with:
    cd backend
    python -m pytest tests/test_engines_stub.py -v
"""

from __future__ import annotations

import json
import pathlib

import pytest

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

BACKEND_ROOT = pathlib.Path(__file__).parents[1]


def _load_json(filename: str) -> dict:
    path = BACKEND_ROOT / filename
    assert path.exists(), f"Config file missing: {path}"
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


# ===========================================================================
# 1. Engine imports
# ===========================================================================


def test_import_question_engine():
    from app.engines.question_engine import QuestionEngine  # noqa: F401


def test_import_red_flag_engine():
    from app.engines.red_flag_engine import RedFlagEngine  # noqa: F401


def test_import_contradiction_engine():
    from app.engines.contradiction_engine import ContradictionEngine  # noqa: F401


def test_import_offline_sync_engine():
    from app.engines.offline_sync_engine import OfflineSyncEngine  # noqa: F401


def test_engines_package_all():
    from app.engines import QuestionEngine, RedFlagEngine, ContradictionEngine, OfflineSyncEngine

    for cls in (QuestionEngine, RedFlagEngine, ContradictionEngine, OfflineSyncEngine):
        assert callable(cls), f"{cls} is not callable"


# ===========================================================================
# 2. Engine stubs raise NotImplementedError
# ===========================================================================


def test_question_engine_raises():
    """Phase 4: QuestionEngine is implemented and returns valid question definitions."""
    from app.engines.question_engine import QuestionEngine

    engine = QuestionEngine()
    q = engine.next_question("enc_test", {})
    assert q is not None
    assert engine.is_complete({}) is False


def test_red_flag_engine_raises():
    """Phase 5: RedFlagEngine is implemented and evaluates answers."""
    from app.engines.red_flag_engine import RedFlagEngine

    engine = RedFlagEngine()
    res = engine.evaluate_answers({})
    assert "triage_level" in res


def test_contradiction_engine_raises():
    """Phase 10: ContradictionEngine is implemented and checks contradictions."""
    from app.engines.contradiction_engine import ContradictionEngine

    engine = ContradictionEngine()
    contradictions = engine.check_contradictions({})
    assert isinstance(contradictions, list)


def test_offline_sync_engine_raises():
    """Phase 13: OfflineSyncEngine is implemented."""
    from app.engines.offline_sync_engine import OfflineSyncEngine

    engine = OfflineSyncEngine()
    assert hasattr(engine, "sync_offline_batch")


# ===========================================================================
# 3. Service imports
# ===========================================================================


def test_import_llm_service():
    from app.services.llm_service import LLMService  # noqa: F401


def test_import_ocr_service():
    from app.services.ocr_service import OCRService  # noqa: F401


def test_import_voice_service():
    from app.services.voice_service import VoiceService  # noqa: F401


def test_import_escalation_service():
    from app.services.escalation_service import EscalationService  # noqa: F401


def test_import_audit_service():
    from app.services.audit_service import AuditService  # noqa: F401


def test_import_fhir_service():
    from app.services.fhir_service import FHIRService  # noqa: F401


def test_import_abha_service():
    from app.services.abha_service import ABHAService  # noqa: F401


def test_import_reminder_service():
    from app.services.reminder_service import ReminderService  # noqa: F401


def test_import_ayush_service():
    from app.services.ayush_service import AYUSHService  # noqa: F401


def test_services_package_all():
    from app.services import (
        LLMService,
        OCRService,
        VoiceService,
        EscalationService,
        AuditService,
        FHIRService,
        ABHAService,
        ReminderService,
        AYUSHService,
    )

    for cls in (
        LLMService,
        OCRService,
        VoiceService,
        EscalationService,
        AuditService,
        FHIRService,
        ABHAService,
        ReminderService,
        AYUSHService,
    ):
        assert callable(cls), f"{cls} is not callable"


# ===========================================================================
# 4. Integration client imports
# ===========================================================================


def test_import_gemini_client():
    from app.integrations.gemini_client import GeminiClient  # noqa: F401


def test_import_paddle_ocr_client():
    from app.integrations.paddle_ocr_client import PaddleOCRClient  # noqa: F401


def test_import_bhashini_client():
    from app.integrations.bhashini_client import BhashiniClient  # noqa: F401


def test_import_abdm_client():
    from app.integrations.abdm_client import ABDMClient  # noqa: F401


def test_integrations_package_all():
    from app.integrations import GeminiClient, PaddleOCRClient, BhashiniClient, ABDMClient

    for cls in (GeminiClient, PaddleOCRClient, BhashiniClient, ABDMClient):
        assert callable(cls), f"{cls} is not callable"


# ===========================================================================
# 5. JSON configuration file validation
# ===========================================================================


def test_questions_json_valid():
    data = _load_json("questions.json")
    assert "questions" in data, "questions.json must have a 'questions' key"
    assert isinstance(data["questions"], list)
    assert len(data["questions"]) > 0, "questions.json must have at least one question"
    for q in data["questions"]:
        assert "id" in q, f"Question missing 'id': {q}"
        assert "text" in q, f"Question missing 'text': {q}"
        assert "type" in q, f"Question missing 'type': {q}"


def test_ayush_questions_json_valid():
    data = _load_json("ayush_questions.json")
    assert "modules" in data, "ayush_questions.json must have a 'modules' key"
    assert isinstance(data["modules"], dict)


def test_red_flags_json_valid():
    data = _load_json("red_flags.json")
    assert "rules" in data, "red_flags.json must have a 'rules' key"
    assert isinstance(data["rules"], list)
    assert len(data["rules"]) > 0, "red_flags.json must have at least one rule"
    for rule in data["rules"]:
        assert "rule_id" in rule,  f"Rule missing 'rule_id': {rule}"
        assert "severity" in rule, f"Rule missing 'severity': {rule}"
        assert rule["severity"] in {"critical", "high", "moderate"}, (
            f"Invalid severity '{rule['severity']}' in rule {rule['rule_id']}"
        )


# ===========================================================================
# 6. Safety: no secrets in any stub file
# ===========================================================================

STUB_FILES = list((BACKEND_ROOT / "app").rglob("*.py"))
SECRET_PATTERNS = ["API_KEY=", "api_key=", "password=", "secret=", "token="]


@pytest.mark.parametrize("filepath", STUB_FILES)
def test_no_hardcoded_secrets(filepath: pathlib.Path):
    content = filepath.read_text(encoding="utf-8")
    for pattern in SECRET_PATTERNS:
        assert pattern not in content, (
            f"Possible hardcoded secret '{pattern}' found in {filepath}"
        )
