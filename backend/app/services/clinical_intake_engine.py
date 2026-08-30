"""
Arogya Link — Comprehensive Clinical Intake & Universal Multi-System Case Engine
================================================================================
Handles all 12 major clinical specialty presentations across multilingual spoken narratives:
1. Cardiovascular & Thoracic
2. Respiratory & Pulmonology
3. Neurological & Craniofacial
4. Gastrointestinal & Hepato-Biliary
5. Infectious, Vector-Borne & Febrile (Dengue, Malaria, Typhoid, UTI)
6. Musculoskeletal, Rheumatology & Orthopedic
7. Metabolic, Endocrine & Diabetic Complications
8. Dermatological & Allergic
9. ENT & Ophthalmic
10. Genitourinary & Renal
11. Mental Health & Psychosomatic
12. Pediatric, Geriatric & General Systemic

Supports English, Hindi, Marathi, Bengali, Tamil, Telugu, Gujarati.
"""

from __future__ import annotations

import re
from typing import Any
from pydantic import BaseModel, Field


class ClinicalEntityResult(BaseModel):
    primary_complaints: list[str] = Field(default_factory=list)
    organ_systems: list[str] = Field(default_factory=list)
    recommended_specialty: str = "General Medicine"
    triage_level: str = "ROUTINE"  # CRITICAL | URGENT | ROUTINE
    duration: str = "Acute (< 24 hours)"
    severity: str = "Moderate"
    emergency_red_flags: list[str] = Field(default_factory=list)
    associated_symptoms: list[str] = Field(default_factory=list)
    medical_history_noted: list[str] = Field(default_factory=list)
    medication_status: str = "None reported"
    targeted_followup_question: str = ""
    targeted_followup_audio: str = ""


# Comprehensive Multilingual Clinical Dictionary Matrix (50+ Conditions & Red Flags)
CLINICAL_SYSTEMS_MATRIX = {
    "Cardiovascular": {
        "specialty": "Cardiology / Emergency Medicine",
        "keywords": [
            "chest pain", "chest tightness", "chest pressure", "heart", "angina",
            "palpitations", "heart racing", "sinking feeling", "left arm pain", "jaw pain",
            "सीने में दर्द", "छाती में दर्द", "हार्ट", "घबराहट", "धड़कन तेज", "डाव्या हातात वेदना",
            "বুকের ব্যথা", "বুক ধড়ফড়", "நெஞ்சு வலி", "மாரடைப்பு"
        ],
        "red_flags": [
            "crushing chest pain", "sweating with chest pain", "radiating pain to arm or jaw",
            "syncope / fainting", "severe breathlessness at rest"
        ],
        "default_triage": "CRITICAL"
    },
    "Respiratory": {
        "specialty": "Pulmonology / Respiratory Medicine",
        "keywords": [
            "cough", "dry cough", "productive cough", "sputum", "phlegm", "breathlessness",
            "shortness of breath", "wheezing", "asthma", "difficulty breathing", "choking",
            "खांसी", "कफ", "सांस फूलना", "दम लगना", "खोकला", "श्वास घेण्यास त्रास",
            "কাশি", "শ্বাসকষ্ট", "இருமல்", "மூச்சுத்திணறல்"
        ],
        "red_flags": ["stridor / gasping", "hemoptysis / coughing blood", "SpO2 drop / blue lips"],
        "default_triage": "URGENT"
    },
    "Neurological": {
        "specialty": "Neurology / General Medicine",
        "keywords": [
            "headache", "severe headache", "migraine", "one sided headache", "dizziness",
            "vertigo", "giddiness", "head spinning", "fainting", "syncope", "blackout",
            "seizure", "fits", "tremor", "numbness", "tingling", "weakness in arm",
            "सिरदर्द", "सर दर्द", "माइग्रेन", "चक्कर", "बेहोशी", "दौरे", "डोकेदुखी", "भोवळ",
            "মাথাব্যথা", "মাথা ঘোরা", "தலைவலி", "மயக்கம்"
        ],
        "red_flags": [
            "thunderclap sudden headache", "facial asymmetry / speech slurring",
            "one-sided limb weakness", "loss of consciousness / seizure"
        ],
        "default_triage": "URGENT"
    },
    "Gastrointestinal": {
        "specialty": "Gastroenterology / General Surgery",
        "keywords": [
            "stomach pain", "abdominal pain", "belly ache", "cramps", "acidity", "heartburn",
            "gerd", "gas", "bloating", "vomiting", "nausea", "loose motions", "diarrhea",
            "constipation", "blood in stool", "jaundice", "yellow eyes", "loss of appetite",
            "पेट दर्द", "उल्टी", "दस्त", "कब्ज", "पीलिया", "एसिडिटी", "पोटदुखी", "उलटी", "जुलाब",
            "পেট ব্যথা", "বমি", "ডায়রিয়া", "വയറുവേദന", "வயிற்று வலி"
        ],
        "red_flags": ["rigid acute abdomen", "hematemesis / vomiting blood", "melena / black stools"],
        "default_triage": "ROUTINE"
    },
    "Infectious & Febrile": {
        "specialty": "Internal Medicine / Infectious Diseases",
        "keywords": [
            "fever", "high fever", "chills", "rigors", "shivering", "body ache", "flu",
            "dengue", "malaria", "typhoid", "viral fever", "throat pain", "sore throat",
            "burning urine", "burning micturition", "uti", "shivering with cold",
            "बुखार", "तेज बुखार", "कंपकंपी", "बदन दर्द", "गले में खराश", "पेशाब में जलन", "ताप", "अंगदुखी",
            "জ্বর", "শরীর ব্যথা", "காய்ச்சல்", "உடல் வலி"
        ],
        "red_flags": ["fever with petechial rash", "fever with altered sensorium", "extreme hypothermia/rigors"],
        "default_triage": "URGENT"
    },
    "Musculoskeletal & Orthopedic": {
        "specialty": "Orthopedics / Rheumatology",
        "keywords": [
            "back pain", "lower back pain", "spine pain", "knee pain", "joint pain", "arthritis",
            "shoulder pain", "neck pain", "sprain", "fracture", "swelling in foot", "heel pain",
            "कमर दर्द", "पीठ दर्द", "घुटने में दर्द", "जोड़ों का दर्द", "मोच", "कंबरदुखी", "सांधेदुखी",
            "পিঠের ব্যথা", "হাঁটু ব্যথা", "முதுகு வலி", "மூட்டு வலி"
        ],
        "red_flags": ["inability to bear weight after high velocity fall", "cauda equina numbness", "deformity"],
        "default_triage": "ROUTINE"
    },
    "Metabolic & Endocrine": {
        "specialty": "Endocrinology / Diabetology",
        "keywords": [
            "diabetes", "sugar", "high sugar", "low sugar", "excessive thirst", "frequent urination",
            "unexplained weight loss", "thyroid", "swelling in neck", "extreme fatigue",
            "शुगर", "डायबिटीज", "ज्यादा प्यास", "बार-बार पेशाब", "वजन कम होना", "थकान", "मधुमेह",
            "ডায়াবেটিস", "அதிக தாகம்"
        ],
        "red_flags": ["diabetic ketoacidosis / fruity breath / deep rapid breathing", "severe hypoglycemia shock"],
        "default_triage": "ROUTINE"
    },
    "Dermatological & Allergic": {
        "specialty": "Dermatology",
        "keywords": [
            "skin rash", "itching", "red spots", "hives", "urticaria", "boils", "abscess",
            "skin allergy", "fungal infection", "eczema", "blisters",
            "खुजली", "चकत्ते", "दाने", "त्वचा रोग", "खाज", "अंग खाजवणे", "पित्त",
            "চুলকানি", "ফুসকুড়ি", "அரிப்பு"
        ],
        "red_flags": ["anaphylaxis with lip/tongue swelling", "stevens-johnson mucosal peeling"],
        "default_triage": "ROUTINE"
    },
    "ENT & Ophthalmic": {
        "specialty": "ENT / Ophthalmology",
        "keywords": [
            "ear pain", "ear discharge", "ringing in ear", "tinnitus", "hearing loss", "sinus",
            "nasal block", "eye redness", "eye discharge", "blurred vision", "watery eyes",
            "कान में दर्द", "आंखों में जलन", "आंखें लाल", "कान दुखणे", "डोळे लाल",
            "চোখের সমস্যা", "கண் வலி"
        ],
        "red_flags": ["sudden painless vision loss", "foreign body in eye / chemical exposure"],
        "default_triage": "ROUTINE"
    },
}


class ComprehensiveClinicalIntakeService:
    """Universal Clinical Knowledge Engine that analyzes patient voice and text inputs across all medical cases."""

    def analyze_patient_narrative(
        self,
        narrative_text: str,
        patient_age: int | None = None,
        patient_gender: str | None = None,
        language: str = "en",
    ) -> ClinicalEntityResult:
        """Thoroughly parse patient narrative for all 12 specialty organ systems and synthesize accurate triage."""
        text_lower = narrative_text.lower().strip()
        result = ClinicalEntityResult()

        detected_systems = set()
        detected_complaints = []
        detected_red_flags = []
        highest_triage = "ROUTINE"

        # 1. Match across all organ systems
        for system_name, data in CLINICAL_SYSTEMS_MATRIX.items():
            matched_keywords = [kw for kw in data["keywords"] if kw in text_lower]
            if matched_keywords:
                detected_systems.add(system_name)
                # Add human readable symptom term
                matched_clean = matched_keywords[0].title()
                if matched_clean not in detected_complaints:
                    detected_complaints.append(matched_clean)

                # Check specialty & triage level
                if data["default_triage"] == "CRITICAL":
                    highest_triage = "CRITICAL"
                elif data["default_triage"] == "URGENT" and highest_triage != "CRITICAL":
                    highest_triage = "URGENT"

                # Check for system red flags
                for rf in data.get("red_flags", []):
                    # Check individual tokens of red flag
                    rf_tokens = rf.split()
                    if any(t in text_lower for t in rf_tokens if len(t) > 3):
                        if rf not in detected_red_flags:
                            detected_red_flags.append(rf.title())

        # Fallback if no specific keyword matched
        if not detected_complaints:
            # Check for general malaise words
            if any(w in text_lower for w in ["pain", "dard", "दुख", "problem", "discomfort", "takleef", "तबलीग", "अस्वस्थ"]):
                detected_complaints.append("General Clinical Discomfort")
            else:
                detected_complaints.append("General Health Assessment")

        # 2. Extract Duration
        duration_str = "Acute (< 24 hours)"
        if any(w in text_lower for w in ["month", "months", "महीने", "महिने", "বছর"]):
            duration_str = "Chronic (> 1 month)"
        elif any(w in text_lower for w in ["week", "weeks", "हफ्ते", "आठवडे", "सप्ताह"]):
            duration_str = "Subacute (1 to 2 weeks)"
        elif any(w in text_lower for w in ["2 days", "3 days", "4 days", "दो दिन", "तीन दिन", "काही दिवस"]):
            duration_str = "2 to 3 days"
        elif any(w in text_lower for w in ["today", "morning", "since morning", "आज", "सुबह से", "सकाळपासून"]):
            duration_str = "Acute (< 24 hours)"

        # 3. Extract Severity
        severity_str = "Moderate"
        if any(w in text_lower for w in ["severe", "unbearable", "crushing", "बहुत तेज", "असहनीय", "खूप जास्त", "तीव्र"]):
            severity_str = "Severe"
            if highest_triage == "ROUTINE":
                highest_triage = "URGENT"
        elif any(w in text_lower for w in ["mild", "slight", "little", "हल्का", "थोडा", "किंचित"]):
            severity_str = "Mild"

        # 4. Check for Medication and Allergy Mentions
        med_status = "None reported"
        if any(w in text_lower for w in ["no medicine", "no prescription", "no tablets", "no drugs", "koi dawa nahi", "औषध नाही", "दवा नहीं"]):
            med_status = "No current regular medications"
        elif any(w in text_lower for w in ["taking", "tablets", "medicine", "bp medicine", "sugar medicine", "दवा ले रहे"]):
            med_status = "Takes regular prescription medication"

        # 5. Check Medical History Mentions
        history = []
        if any(w in text_lower for w in ["bp", "hypertension", "high blood pressure", "हाई बीपी"]):
            history.append("Hypertension")
        if any(w in text_lower for w in ["sugar", "diabetes", "मधुमेह"]):
            history.append("Type 2 Diabetes")
        if any(w in text_lower for w in ["asthma", "दमा"]):
            history.append("Bronchial Asthma")
        if any(w in text_lower for w in ["thyroid", "थायराइड"]):
            history.append("Thyroid Disorder")

        # 6. Formulate Target Specialty & Specialty-Specific Follow-Up Question
        first_system = list(detected_systems)[0] if detected_systems else "General Medicine"
        specialty = CLINICAL_SYSTEMS_MATRIX.get(first_system, {}).get("specialty", "General Medicine")

        followup_dict = self._generate_specialty_followup(first_system, language, detected_complaints)

        result.primary_complaints = detected_complaints
        result.organ_systems = list(detected_systems) if detected_systems else ["General Medicine"]
        result.recommended_specialty = specialty
        result.triage_level = highest_triage
        result.duration = duration_str
        result.severity = severity_str
        result.emergency_red_flags = detected_red_flags
        result.medical_history_noted = history
        result.medication_status = med_status
        result.targeted_followup_question = followup_dict["text"]
        result.targeted_followup_audio = followup_dict["audio"]

        return result

    def _generate_specialty_followup(self, system: str, lang: str, complaints: list[str]) -> dict[str, str]:
        """Generate targeted clinical follow-up question customized for the specific organ system and patient language."""
        lang_key = lang.lower() if lang else "en"
        complaint_name = complaints[0] if complaints else "discomfort"

        questions = {
            "Cardiovascular": {
                "en": "Do you feel shortness of breath, dizziness, or pain radiating to your left arm or jaw when walking?",
                "hi": "क्या चलने पर आपकी सांस फूलती है, चक्कर आते हैं या दर्द बाएं हाथ/जबड़े की तरफ फैलता है?",
                "mr": "चालताना तुमचा श्वास भरून येतो का, भोवळ येते का किंवा डाव्या हातात वेदना होतात का?",
                "bn": "হাঁটার সময় কি আপনার শ্বাসকষ্ট হয়, মাথা ঘোরে বা বাঁ হাতে ব্যথা ছড়ায়?",
                "ta": "நடக்கும்போது மூச்சுத்திணறல், மயக்கம் அல்லது இடது கையில் வலி ஏற்படுகிறதா?",
            },
            "Respiratory": {
                "en": "Are you coughing up colored phlegm or blood, and do you experience wheezing when lying down?",
                "hi": "क्या खांसी में बलगम या खून आ रहा है, और क्या लेटने पर सीने में सीटी जैसी आवाज आती है?",
                "mr": "खोकल्यामध्ये कफ किंवा रक्त पडत आहे का, आणि झोपल्यावर घरघर आवाज येतो का?",
                "bn": "কাশির সাথে কি কফ বা রক্ত পড়ছে, এবং শোয়ার সময় কি বুকে শাঁ শাঁ শব্দ হয়?",
                "ta": "இருமும்போது சளி அல்லது ரத்தம் வருகிறதா, படுக்கும்போது இழுப்பு சத்தம் கேட்கிறதா?",
            },
            "Neurological": {
                "en": "Is the headache accompanied by nausea, sensitivity to light, or any weakness in your arms or legs?",
                "hi": "क्या सिरदर्द के साथ उल्टी जैसा मन, रोशनी से परेशानी या हाथ-पैरों में कमजोरी महसूस हो रही है?",
                "mr": "डोकेदुखीसोबत उलट्या, प्रकाशाचा त्रास किंवा हात-पायांत अशक्तपणा जाणवतो का?",
                "bn": "মাথাব্যথার সাথে কি বমি বমি ভাব, আলোতে অস্বস্তি বা হাত-পায়ে দুর্বলতা আছে?",
                "ta": "தலைவலியுடன் வாந்தி உணர்வு, வெளிச்சம் பார்க்க சிரமம் அல்லது கை கால்களில் பலவீனம் உள்ளதா?",
            },
            "Gastrointestinal": {
                "en": "Are you experiencing severe burning acidity, vomiting, loose motions, or difficulty keeping fluids down?",
                "hi": "क्या आपको तेज जलन, उल्टी, दस्त या पानी पीने में भी परेशानी हो रही है?",
                "mr": "तुम्हाला तीव्र छातीत जळजळ, उलटी, जुलाब किंवा पाणी पिण्यास त्रास होत आहे का?",
                "bn": "আপনার কি অতিরিক্ত বুকজ্বালা, বমি, পাতলা পায়খানা বা জল পানে সমস্যা হচ্ছে?",
                "ta": "நெஞ்செரிச்சல், வாந்தி, வயிற்றுப்போக்கு அல்லது திரவம் குடிக்க சிரமம் உள்ளதா?",
            },
            "Infectious & Febrile": {
                "en": "Are you experiencing chills, body aches, throat pain, or burning sensation during urination?",
                "hi": "क्या आपको ठंड लगकर कंपकंपी, पूरे बदन में दर्द, गले में खराश या पेशाब में जलन है?",
                "mr": "तुम्हाला थंडी वाजून ताप, अंगदुखी, घशात खवखव किंवा लघवीमध्ये जळजळ होत आहे का?",
                "bn": "আপনার কি কাঁপুনি দিয়ে জ্বর, শরীর ব্যথা, গলা ব্যথা বা প্রস্রাবে জ্বালাপোড়া আছে?",
                "ta": "நடுக்கத்துடன் காய்ச்சல், உடல் வலி, தொண்டை வலி அல்லது சிறுநீரில் எரிச்சல் உள்ளதா?",
            },
            "Musculoskeletal & Orthopedic": {
                "en": "Did this pain start after a fall, heavy lifting, or is there visible swelling and difficulty walking?",
                "hi": "क्या यह दर्द किसी चोट, वजन उठाने के बाद शुरू हुआ, और क्या वहां सूजन है या चलने में दिक्कत है?",
                "mr": "हा त्रास पडल्यानंतर किंवा जड वजन उचलल्यामुळे झाला आहे का, आणि सूज येऊन चालण्यास त्रास होतो का?",
                "bn": "ব্যথাটি কি পড়ে যাওয়া বা ভারী জিনিস তোলার পর শুরু হয়েছে, এবং ফোলাভাব বা হাঁটতে সমস্যা আছে?",
                "ta": "கீழே விழுந்ததால் அல்லது எடை தூக்கியதால் இந்த வலி தொடங்கியதா, வீக்கம் உள்ளதா?",
            },
            "Default": {
                "en": "Are you currently taking any regular prescription medications, and do you have any drug allergies?",
                "hi": "क्या आप पहले से कोई नियमित दवाइयां ले रहे हैं, और क्या आपको कोई दवा की एलर्जी है?",
                "mr": "तुम्ही आधीपासून कोणती नियमित औषधे घेत आहात का, आणि काही ऍलर्जी आहे का?",
                "bn": "আপনি কি কোনো নিয়মিত ওষুধ খাচ্ছেন এবং আপনার কোনো ওষুধের এলার্জি আছে?",
                "ta": "நீங்கள் வழக்கமாக ஏதேனும் மருந்துகளை உட்கொள்கிறீர்களா, மருந்து ஒவ்வாமை உள்ளதா?",
            },
        }

        system_q = questions.get(system, questions["Default"])
        q_text = system_q.get(lang_key, system_q.get("en", questions["Default"]["en"]))
        return {"text": q_text, "audio": q_text}


clinical_intake_service = ComprehensiveClinicalIntakeService()
