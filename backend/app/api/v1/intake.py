"""
Arogya Link — api/v1/intake.py
===============================
Adaptive Clinical Intake API Endpoints.

Endpoints:
  - GET  /intake/next-question?encounter_id=...&lang=hi : Fetch next question (optionally translated).
  - POST /intake/answer                                  : Submit answer and get next question.
  - GET  /intake/answers/{encounter_id}                  : Get all submitted answers for encounter.
"""

from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, ConfigDict
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.session_deps import validate_consented_encounter
from app.engines.question_engine import QuestionEngine
from app.models.patient import Encounter

router = APIRouter(prefix="/intake", tags=["intake"])
engine = QuestionEngine()


# ── Inline question translations ──────────────────────────────────────────
# Keys match question IDs in questions.json. Add more languages here as needed.
_Q_TEXT: dict[str, dict[str, str]] = {
    "q_chief_complaint": {
        "hi": "आज आप कौन से मुख्य लक्षण या स्वास्थ्य समस्याएं अनुभव कर रहे हैं?",
        "bn": "আজ আপনি কী প্রধান উপসর্গ বা স্বাস্থ্য সমস্যা অনুভব করছেন?",
        "ta": "இன்று நீங்கள் அனுபவிக்கும் முக்கிய அறிகுறிகள் என்ன?",
        "te": "ఈరోజు మీరు అనుభవిస్తున్న ప్రధాన లక్షణాలు ఏమిటి?",
        "mr": "आज तुम्हाला कोणती मुख्य लक्षणे जाणवत आहेत?",
        "gu": "આજે તમે કયા મુખ્ય લક્ષણો અનુભવો છો?",
    },
    "q_duration": {
        "hi": "आपको ये लक्षण कितने समय से हैं?",
        "bn": "আপনার এই উপসর্গগুলি কতদিন ধরে আছে?",
        "ta": "இந்த அறிகுறிகள் எவ்வளவு காலமாக இருக்கின்றன?",
        "te": "ఈ లక్షణాలు ఎంత కాలంగా ఉన్నాయి?",
        "mr": "तुम्हाला ही लक्षणे किती काळापासून आहेत?",
        "gu": "આ લક્ષણો કેટલા સમયથી છે?",
    },
    "q_severity": {
        "hi": "आप अपनी तकलीफ की गंभीरता को कैसे आंकते हैं?",
        "bn": "আপনার অস্বস্তির মাত্রা কীভাবে মূল্যায়ন করবেন?",
        "ta": "உங்கள் அசௌகரியத்தின் தீவிரத்தை எப்படி மதிப்பிடுவீர்கள்?",
        "te": "మీ అసౌకర్యం యొక్క తీవ్రతను ఎలా రేట్ చేస్తారు?",
        "mr": "तुमच्या त्रासाची तीव्रता तुम्ही कशी मोजाल?",
        "gu": "તમારી અગવડની તીવ્રતા તમે કેવી રીતે રેટ કરશો?",
    },
    "q_associated_symptoms": {
        "hi": "क्या आप इनमें से कोई सहवर्ती लक्षण अनुभव कर रहे हैं?",
        "bn": "আপনি কি এই সহগামী উপসর্গগুলির মধ্যে কোনোটি অনুভব করছেন?",
        "ta": "இந்த தொடர்புடைய அறிகுறிகளில் ஏதேனும் அனுபவிக்கிறீர்களா?",
        "te": "ఈ అనుబంధ లక్షణాలలో ఏదైనా అనుభవిస్తున్నారా?",
        "mr": "तुम्हाला यापैकी कोणती सहोत्पन्न लक्षणे जाणवत आहेत का?",
        "gu": "શું તમે આ સાથેના લક્ષણોમાંથી કોઈ અનુભવી રહ્યા છો?",
    },
    "q_medical_history": {
        "hi": "क्या आपको किसी पुरानी बीमारी का निदान है?",
        "bn": "আপনার কোনো দীর্ঘস্থায়ী চিকিৎসা অবস্থার নির্ণয় আছে কি?",
        "ta": "உங்களுக்கு ஏதேனும் நாள்பட்ட மருத்துவ நோய்கள் கண்டறியப்பட்டுள்ளதா?",
        "te": "మీకు ఏదైనా దీర్ఘకాలిక వైద్య పరిస్థితుల నిర్ధారణ ఉందా?",
        "mr": "तुम्हाला कोणत्याही दीर्घकालीन वैद्यकीय स्थितीचे निदान आहे का?",
        "gu": "શું તમને કોઈ ક્રોનિક તબીબી પરિસ્થિતિઓ નિદાન થઈ છે?",
    },
    "q_medications": {
        "hi": "क्या आप वर्तमान में कोई प्रिस्क्रिप्शन दवाएं ले रहे हैं?",
        "bn": "আপনি কি বর্তমানে কোনো প্রেসক্রিপশন ওষুধ গ্রহণ করছেন?",
        "ta": "நீங்கள் தற்போது பரிந்துரைக்கப்பட்ட மருந்துகள் எடுக்கிறீர்களா?",
        "te": "మీరు ప్రస్తుతం ఏదైనా ప్రిస్క్రిప్షన్ మందులు తీసుకుంటున్నారా?",
        "mr": "तुम्ही सध्या कोणतीही प्रिस्क्रिप्शन औषधे घेत आहात का?",
        "gu": "શું તમે હાલ કોઈ પ્રિસ્ક્રિપ્શન દવાઓ લઈ રહ્યા છો?",
    },
    "q_medication_details": {
        "hi": "कृपया अपनी वर्तमान दवाओं के नाम दर्ज करें (या 'निश्चित नहीं'):",
        "bn": "অনুগ্রহ করে আপনার বর্তমান ওষুধের নাম লিখুন (বা 'নিশ্চিত নই'):",
        "ta": "தற்போதைய மருந்துகளின் பெயர்களை உள்ளிடவும் (அல்லது 'தெரியாது'):",
        "te": "మీ ప్రస్తుత మందుల పేర్లను నమోదు చేయండి (లేదా 'తెలియదు'):",
        "mr": "तुमच्या सध्याच्या औषधांची नावे प्रविष्ट करा (किंवा 'माहीत नाही'):",
        "gu": "તમારી વર્તમાન દવાઓના નામ દાખલ કરો (અથવા 'ખબર નથી'):",
    },
    "q_allergies": {
        "hi": "क्या आपको कोई ज्ञात दवा या खाद्य एलर्जी है?",
        "bn": "আপনার কোনো পরিচিত ওষুধ বা খাবারে অ্যালার্জি আছে কি?",
        "ta": "உங்களுக்கு அறியப்பட்ட மருந்து அல்லது உணவு ஒவ்வாமை உள்ளதா?",
        "te": "మీకు తెలిసిన ఔషధం లేదా ఆహార అలెర్జీలు ఉన్నాయా?",
        "mr": "तुम्हाला कोणत्याही ज्ञात औषध किंवा अन्न एलर्जी आहे का?",
        "gu": "શું તમને જાણીતી દવા અથવા ખોરાકની એલર્જી છે?",
    },
}


def _translate_question(q: dict[str, Any], lang: str) -> dict[str, Any]:
    """Return a copy of question dict with text translated to lang (falls back to English)."""
    if not q or lang == "en":
        return q
    q_copy = dict(q)
    translated_text = _Q_TEXT.get(q["id"], {}).get(lang)
    if translated_text:
        q_copy["text"] = translated_text
    return q_copy


class SubmitAnswerRequest(BaseModel):
    encounter_id: str
    question_id: str
    answer_value: Any


class NextQuestionResponse(BaseModel):
    encounter_id: str
    question: dict[str, Any] | None = None
    is_complete: bool

    model_config = ConfigDict(from_attributes=True)


class SubmitAnswerResponse(BaseModel):
    encounter_id: str
    recorded: bool
    question_id: str
    next_question: dict[str, Any] | None = None
    is_complete: bool


@router.get("/next-question", response_model=NextQuestionResponse)
async def get_next_question(
    encounter_id: str,
    lang: str = "en",
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Fetch the next clinical intake question for an active consented encounter.

    Args:
        encounter_id: Active encounter UUID.
        lang: ISO 639-1 language code (en|hi|bn|ta|te|mr|gu). Defaults to 'en'.
    """
    # 1. Validate encounter exists, is active, and has consent
    await validate_consented_encounter(encounter_id, db)

    # 2. Retrieve submitted answers dictionary
    answers = await engine.get_answers_dict(encounter_id, db)

    # 3. Calculate next question
    next_q = engine.next_question(encounter_id, answers)
    is_comp = engine.is_complete(answers)

    # 4. Translate question text if a non-English lang requested
    translated_q = _translate_question(next_q, lang) if next_q else next_q

    return {
        "encounter_id": encounter_id,
        "question": translated_q,
        "is_complete": is_comp,
    }


@router.post("/answer", response_model=SubmitAnswerResponse)
async def submit_answer(
    body: SubmitAnswerRequest,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Submit an answer to a question and receive the next question in sequence."""
    # 1. Validate encounter exists, is active, and has consent
    await validate_consented_encounter(body.encounter_id, db)

    # 2. Record answer in DB
    await engine.record_answer(
        encounter_id=body.encounter_id,
        question_id=body.question_id,
        value=body.answer_value,
        db=db,
    )

    # 3. Fetch updated answers
    answers = await engine.get_answers_dict(body.encounter_id, db)

    # 4. Determine next question & completion status
    next_q = engine.next_question(body.encounter_id, answers)
    is_comp = engine.is_complete(answers)

    return {
        "encounter_id": body.encounter_id,
        "recorded": True,
        "question_id": body.question_id,
        "next_question": next_q,
        "is_complete": is_comp,
    }


@router.get("/answers/{encounter_id}")
async def get_encounter_answers(
    encounter_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict[str, Any]:
    """Retrieve all submitted intake answers for an encounter."""
    await validate_consented_encounter(encounter_id, db)
    answers = await engine.get_answers_dict(encounter_id, db)
    return {
        "encounter_id": encounter_id,
        "answers_count": len(answers),
        "answers": answers,
    }
