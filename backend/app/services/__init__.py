"""
Arogya Link — backend/app/services
=====================================
Service modules orchestrate business workflows by coordinating engines,
database models, and external integration clients.

Services are populated phase-by-phase:
  Phase 7  → escalation_service   (WebSocket real-time escalation)
  Phase 8  → ocr_service          (PaddleOCR document processing)
  Phase 9  → voice_service        (Bhashini / Whisper transcription)
  Phase 10 → llm_service          (Gemini clinical summary)
  Phase 12 → audit_service        (append-only audit logging)
  Phase 14 → fhir_service         (FHIR-compatible JSON export)
  Phase 15 → abha_service         (ABHA / ABDM integration)
  Phase 16 → ayush_service        (AYUSH assessment module)
  Phase 17 → reminder_service     (appointment & medicine reminders)

No service may be imported before its dependent engine/model is implemented.
"""

from app.services.llm_service import LLMService
from app.services.ocr_service import OCRService
from app.services.voice_service import VoiceService
from app.services.escalation_service import EscalationService
from app.services.audit_service import AuditService
from app.services.fhir_service import FHIRService
from app.services.abha_service import ABHAService
from app.services.reminder_service import ReminderService
from app.services.ayush_service import AYUSHService

__all__ = [
    "LLMService",
    "OCRService",
    "VoiceService",
    "EscalationService",
    "AuditService",
    "FHIRService",
    "ABHAService",
    "ReminderService",
    "AYUSHService",
]
