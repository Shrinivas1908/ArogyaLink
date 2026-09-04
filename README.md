# 🏥 ArogyaLink (आरोग्य लिंक)
> **AI-Powered Multimodal Clinical Triage, Prescription OCR Digitizer & ABDM Decision-Support Ecosystem**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.6%2F3.7_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![OCR](https://img.shields.io/badge/OCR-Gemini_Vision_%2B_Tesseract-8B5CF6.svg)](#-prescription--document-ocr-engine)
[![Bhashini](https://img.shields.io/badge/Bhashini-ULCA_Speech_AI-FF9933.svg)](https://bhashini.gov.in)
[![Indic Languages](https://img.shields.io/badge/Multilingual-7%2B_Indic_Languages-10B981.svg)](#-voice-touch--multilingual-architecture)
[![DPDP Act](https://img.shields.io/badge/Privacy-DPDP_Act_2023_Compliant-0284C7.svg)](#-security-encryption--data-privacy)
[![FHIR R4](https://img.shields.io/badge/HL7_FHIR-R4_Conformant-E31B23.svg)](https://hl7.org/fhir/R4/)
[![ABDM](https://img.shields.io/badge/ABDM-Sandbox_Ready-FF9933.svg)](https://abdm.gov.in)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
- [Universal 12-Organ-System Clinical AI Engine](#-universal-12-organ-system-clinical-ai-engine)
- [Prescription & Document OCR Engine](#-prescription--document-ocr-engine)
- [Voice, Touch & Multilingual Architecture](#-voice-touch--multilingual-architecture)
- [Organized FHIR R4 Bundle Directory](#-organized-fhir-r4-bundle-directory)
- [Security, Encryption & Data Privacy](#-security-encryption--data-privacy)
- [UI/UX Design System & Ergonomics](#-uiux-design-system--ergonomics)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Quickstart & Docker Execution](#-quickstart--docker-execution)
- [Cloud Deployment (Render & Vercel)](#-cloud-deployment-option-b)
- [API Endpoints](#-api-endpoints)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🌟 Overview

**ArogyaLink** is an enterprise-grade clinical decision-support and patient triage platform tailored for high-volume Outpatient Departments (OPDs), Community Health Centers (CHCs), AYUSH clinics, and tertiary hospitals.

It bridges the gap between rapid, multilingual patient intake and focused doctor workflow by providing:
1. **Multimodal Patient Check-in**: Regional Indian voice recognition and touch-first kiosk questionnaire with DPDP Act 2023 compliant digital consent.
2. **Universal 12-Organ-System Clinical AI**: Extracts symptoms, red flags, duration, and severity across all medical disciplines and automatically synthesizes targeted live clinical follow-up questions.
3. **Multi-Turn Narrative Merging**: Follow-up answers (e.g. *"feeling acidity"*) are automatically parsed and merged with primary complaints (e.g. *"nausea and vomiting"*) so nothing is lost in clinical summaries.
4. **Authentic Prescription & Lab OCR**: Real document entity extraction using **Gemini 3.6-Flash Multimodal Vision**, **Tesseract OCR with OpenCV adaptive binarization**, **PyMuPDF**, and **BioClinical-NER** with zero synthetic mock data.
5. **Organized FHIR R4 Bundle Directory**: Interactive 2-column directory with live schema inspector, 1-click clipboard copying, and batch export conformant with ABDM.
6. **Doctor OPD Dashboard**: Real-time queue prioritization (`CRITICAL`, `URGENT`, `ROUTINE`), AYUSH drug-herb interaction checks, digital Rx generator, and 1-click encounter management.

---

## 🚀 Key Features & Modules

### 1. 🩺 Doctor OPD Clinical Dashboard (`http://localhost/doctor/` or Port 5174)
- **Live Triaged Queue**: Real-time prioritization of incoming encounters into `CRITICAL`, `URGENT`, and `ROUTINE`.
- **Traceable Clinical Synthesis**:
  - **⚡ Quick Doctor Snapshot**: 1-sentence high-yield summary for instant doctor grasp.
  - **🗣️ Patient-Friendly Explanation**: Plain-language explanation for patients and families.
  - **Structured Differentials**: Likelihood badges (`High`, `Moderate`, `Low`) with clinical reasoning.
  - **Action Checklist**: Recommended vitals check, 12-lead ECG, and priority lab orders.
- **Rx OCR Sub-tab**: Visualizes detected medications (`dosage`, `frequency`, `duration`), diagnostic lab tables, and verbatim transcribed text.
- **🌿 AYUSH Drug-Herb Interaction Checker**: Real-time safety validation preventing adverse interactions between Ayurvedic/Herbal formulations and Allopathic prescriptions.
- **📁 Organized FHIR R4 Bundle Directory**: Interactive JSON inspector and ABDM export vault.
- **🗑️ Encounter Queue Management**: Clear individual completed encounters or reset the entire OPD queue with 1 click.

### 2. 📱 Multilingual Patient Touch & Voice Kiosk (`http://localhost/kiosk/` or Port 5173)
- **Mandatory Patient Verification**: Enforces full patient name capture with dedicated **"🎙️ Speak Name (बोलें)"** voice button.
- **Hybrid Touch + Voice Intake**: Large touch chips for all common OPD symptoms combined with a custom voice/text field to capture nuanced symptoms together.
- **🎙️ 50+ Word Spoken Narrative Intake**: Patients speak freely about symptoms; the AI extracts primary complaints and poses dynamic, targeted clinical follow-up questions.
- **🔊 Crystal-Clear Natural Voice Synthesis**: Automatic selection of High-Definition Neural/Natural Indian voices (`Google हिन्दी`, `Microsoft Swara Natural`, `Google मराठी`) with 0.88x pacing and emoji/markdown sanitization.
- **📄 Document & Prescription Scanner**: Upload camera photos or PDFs of old prescriptions and lab reports for instant entity extraction.
- **🪪 ABHA ID & DPDP Consent**: Seamless ABHA authentication and DPDP Act 2023 compliant digital consent capture.

### 3. 🌐 Unified Showcase Portal (`http://localhost/` or Port 5175)
- Public landing page, AYUSH hospital directory, appointment booking, and interactive live voice triage assistant.

---

## 🫀 Universal 12-Organ-System Clinical AI Engine

ArogyaLink implements a comprehensive clinical ontology engine (`clinical_intake_engine.py`) covering all major medical organ systems:

| Organ System | Specialties Covered | Example Matched Symptoms | Emergency Red Flags |
| :--- | :--- | :--- | :--- |
| **Cardiovascular** | Cardiology / Emergency Medicine | Chest pain, pressure, left arm pain, palpitations | Crushing chest pain radiating to jaw/left arm, syncope |
| **Respiratory** | Pulmonology / Chest Medicine | Breathlessness, wheezing, cough with sputum, hemoptysis | Severe stridor, cyanosis, acute respiratory distress |
| **Gastrointestinal** | Gastroenterology / General Surgery | Stomach pain, vomiting, nausea, acidity, GERD, diarrhea | Rigid acute abdomen, hematemesis, melena |
| **Neurological** | Neurology / General Medicine | Severe headache, migraine, dizziness, vertigo, seizures | Thunderclap headache, facial asymmetry, limb weakness |
| **Infectious & Febrile** | Internal Medicine / Infectious Diseases | Fever, chills, rigors, body ache, sore throat, burning urine | Petechial rash, altered sensorium, extreme rigors |
| **Musculoskeletal** | Orthopedics / Rheumatology | Joint pain, backache, swelling, knee pain, sprain | Open fracture, sudden loss of limb sensation |
| **Endocrine & Metabolic** | Endocrinology / Diabetology | Extreme thirst, frequent urination, weight loss, heat intolerance | Diabetic ketoacidosis signs, severe hypoglycemia |
| **Genitourinary & Renal** | Urology / Nephrology | Flank pain, blood in urine, reduced urine output, dysuria | Anuria > 12h, gross hematuria with clots |
| **Dermatological** | Dermatology / Allergy | Generalized rash, severe itching, hives, blisters | Rapidly spreading rash with mucosal involvement |
| **Pediatric** | Pediatrics | High fever in infant, persistent crying, refusal to feed | Lethargy, poor feeding, sunken fontanelle |
| **Obstetric & Gynecological** | OB/GYN | Lower abdominal cramps, missed period, abnormal bleeding | Severe pelvic pain with syncope, heavy bleeding |
| **ENT & Ophthalmic** | ENT / Ophthalmology | Ear discharge, tinnitus, eye redness, blurred vision | Sudden painless vision loss, chemical exposure |

---

## 📄 Prescription & Document OCR Engine

ArogyaLink incorporates an enterprise multi-tier clinical document processing pipeline engineered to ingest complex, noisy Indian doctor handwriting, camera snapshots, shadow-distorted paper notes, and digital diagnostic lab PDFs:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    Uploaded Rx Image or PDF Document                    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
               ┌─────────────────────┴─────────────────────┐
               ▼                                           ▼
      [Is PDF Document?]                          [Is Image File?]
               │                                           │
      ┌────────┴────────┐                         ┌────────┴────────┐
      ▼                 ▼                         ▼                 ▼
   PyMuPDF        BioClinical-NER        OpenCV Pre-Processing   Gemini 2.5/3.6 Flash
   (Direct PDF)   (Entity Extractor)     • Morphological Shadow  (Multimodal Vision)
                                           Division & Deskewing            │
                                         • CLAHE Ink Contrast              ▼
                                                    │           Fuzzy Entity Matching
                                                    └──────────────► • CDSCO/RxNorm Formulary
                                                                     • Lab Reference Range Flags
                                                                     • Dosage & Frequency (1-0-1)
                                                                           │
                                                                           ▼
                                                        ┌────────────────────────────────────┐
                                                        │  100% Honest Clinical JSON Output  │
                                                        │ • Verbatim Transcribed Text        │
                                                        │ • Standardized Rx Drugs & Timings  │
                                                        │ • Diagnostic Flags & Lab Panels    │
                                                        │ • Auto-synced to Patient Intake    │
                                                        └────────────────────────────────────┘
```

### Key Technical Improvements
1. **OpenCV Pre-Processing Pipeline**: Automatic contour-based deskewing and morphological background division (`255 - absdiff(gray, bg_blur)`) to flatten phone shadows and dim lighting before feeding images to vision models.
2. **Gemini 2.5 / 3.6 Flash Multimodal Vision**: Vision LLM prompt with few-shot Indian prescription patterns (`1-0-1`, `OD`, `BD`, `TDS`, `HS`, `SOS`) and 25s client resilience timeouts.
3. **Fuzzy Medical Entity Resolution**: Matches noisy OCR transcriptions (e.g. *"Paracetmol"*, *"Pan-D"*, *"Augmentn"*) against a clinical drug database (`COMMON_DRUGS_DB`) and lab panels (`COMMON_LABS_REF`) using similarity thresholds to ensure clean clinical names, dosages, and drug categories.
4. **Chain-of-Thought (CoT) Grounded Summaries**: Summarizes clinical findings with zero hallucinations, linking intake answers directly with OCR active medications and red flags.

---

## 🗣️ Voice, Touch & Multilingual Architecture

| Capability | Implementation & Technology | Highlights |
| :--- | :--- | :--- |
| **Speech-to-Text (ASR / STT)** | Web Speech API (`webkitSpeechRecognition`) + Bhashini ULCA ASR Pipeline | Continuous interim transcription, auto speech detection, and graceful offline fallback |
| **Voice Synthesis (TTS)** | High-Definition Neural Voice Selector (`Google हिन्दी`, `Microsoft Swara Natural`, `Google मराठी`) | 0.88x speed pacing, sanitizes raw markdown/emojis for crystal-clear regional pronunciation |
| **Languages Supported** | Hindi (`hi-IN`), Bengali (`bn-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Marathi (`mr-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), English (`en-IN`) | Full Indic script typography & localized clinical symptom ontology |
| **Hybrid Touch UX** | Ergonomic touch design (min 48px targets), multi-select symptom chips, custom voice/text add-on | Combines touched pills with spoken/typed notes seamlessly |

---

## 📁 Organized FHIR R4 Bundle Directory

The Doctor Dashboard includes a dedicated **FHIR R4 Exports Directory** (`FHIRExportsView.jsx`):
* **2-Column Workspace**: Encounter selector on the left, live syntax-highlighted FHIR R4 JSON schema inspector on the right.
* **1-Click Actions**: One-click clipboard copy and `.json` file download for individual encounters or entire OPD batches.
* **ABDM Sandbox Ready**: Standard `Bundle`, `Patient`, `Encounter`, `Condition`, `Observation`, and `MedicationStatement` resources.

---

## 🔒 Security, Encryption & Data Privacy

- **🔐 End-to-End Encryption in Transit**: All communications secured via TLS 1.3 / HTTPS encryption.
- **📜 DPDP Act 2023 Compliant Consent**: Multi-stage explicit digital consent before data capture.
- **🛡️ Immutable Medico-Legal Audit Trail**: Every doctor action is logged with SHA-256 integrity, UTC timestamps, and physician IDs.
- **🪪 ABHA & ABDM Privacy Boundaries**: Complies with Ayushman Bharat Digital Mission M1/M2/M3 privacy guidelines with tokenized patient health identifiers.

---

## 🏗️ System Architecture

```
                                  ┌────────────────────────┐
                                  │   Google Gemini 3.6/   │
                                  │   3.7 Multimodal AI    │
                                  └───────────▲────────────┘
                                              │
┌─────────────────────────┐       ┌───────────▼────────────┐       ┌────────────────────────┐
│  Patient Kiosk (5173)   │ ───►  │   FastAPI Backend      │ ───►  │ Doctor Dashboard(5174) │
│  - Touch & Voice Intake │       │   Port 8000            │       │ - Severity Triage      │
│  - 7+ Indic Languages   │ ◄───  │   - Bhashini Voice STT │ ◄───  │ - AI Synthesis (HPI)   │
│  - DPDP Consent Record  │       │   - OCR Engine (Tess)  │       │ - Audit & Overrides    │
│  - Prescription Upload  │       │   - 12-System AI Model │       │ - FHIR R4 Bundle Vault │
└─────────────────────────┘       │   - Queue & FHIR API   │       └────────────────────────┘
                                  │   - Security & Audit   │
┌─────────────────────────┐       └───────────▲────────────┘
│  Unified Portal (5175)  │ ──────────────────┘
└─────────────────────────┘
```

---

## 💻 Tech Stack

### AI, Multimodal & Speech Processing
- **LLM Synthesis & Triage**: Google Gemini 3.6/3.7 Flash Multimodal API, Groq Llama-3.3-70b, Pydantic v2
- **Voice Recognition (STT)**: Web Speech API with continuous audio stream + Bhashini ULCA ASR
- **Voice Synthesis (TTS)**: Neural Indian voice selector with 0.88x pacing
- **Document OCR & NER**: Gemini Multimodal Vision, Tesseract OCR (`pytesseract`), PyMuPDF (`pymupdf`), OpenCV CLAHE, BioClinical-NER

### Backend
- **Framework**: Python 3.11+, FastAPI 0.115
- **Database & ORM**: PostgreSQL / Supabase, SQLAlchemy 2.0 (AsyncPG), Alembic migrations
- **Reverse Proxy / Gateway**: Nginx Gateway routing all apps through Port 80

### Frontend & UI/UX
- **Framework**: React 19.2, React Router v7, Vite 8.2
- **Design Tokens**: TailwindCSS v4 with Warm Linen & Cream Organic theme
- **Typography**: Google Fonts (*Fraunces*, *Newsreader*, *Plus Jakarta Sans*, *Inter*)

---

## ⚡ Quickstart & Docker Execution

### Start Entire System with Docker (Single Command)
```bash
docker compose up -d --build
```

### Live Local Access URLs:
* 🏥 **Main ArogyaLink Portal**: **[http://localhost/](http://localhost/)** *(Port 5175: `http://localhost:5175`)*
* 👨‍⚕️ **Doctor OPD Dashboard**: **[http://localhost/doctor/](http://localhost/doctor/)** *(Port 5174: `http://localhost:5174`)*
* 📱 **Patient Intake Kiosk**: **[http://localhost/kiosk/](http://localhost/kiosk/)** *(Port 5173: `http://localhost:5173`)*
* ⚡ **FastAPI Interactive Docs**: **[http://localhost:8000/docs](http://localhost:8000/docs)**

---

## ☁️ Cloud Deployment (Option B)

### Backend & Database on Render
1. Connect repository `Shrinivas1908/ArogyaLink` to [Render](https://dashboard.render.com/).
2. Select **"Blueprint"** — Render automatically uses [`render.yaml`](file:///c:/Users/HP/OneDrive/Desktop/ArogyaLink/render.yaml) to provision PostgreSQL + FastAPI Docker web service.

### Frontends on Vercel
Deploy the 3 frontend apps on [Vercel](https://vercel.com/) with configured `vercel.json` SPA rewrites:
* **Portal**: Root directory `apps/portal`
* **Doctor Dashboard**: Root directory `apps/doctor-dashboard`
* **Patient Kiosk**: Root directory `apps/patient-kiosk`

---

## 🤖 n8n Cloud Automation & Real-Time Alerting

ArogyaLink features native, bidirectional integration with **n8n Cloud Automation Workflows**:
- **Outbound Webhook Dispatch**: Automatically triggers the configured n8n webhook (`N8N_WEBHOOK_URL`) upon critical clinical and operational events:
  - `EMERGENCY_ESCALATION`: Real-time alerts when red flags or `CRITICAL` triage levels are detected.
  - `PATIENT_CHECKIN`: Notifies external systems when a patient arrives at the kiosk or logs in with ABHA.
  - `PATIENT_LOGIN_OTP`: Dispatches patient verification codes via n8n for SMS / WhatsApp delivery.
  - `MEDICATION_REMINDER`: Pushes scheduled prescription reminders to external communication workflows.
  - `TEST_PING`: Diagnostic health check from the Doctor Review Workspace.
- **Inbound Audit Post-Responses**: Supports incoming HTTP POST execution responses from n8n (`POST /notifications/n8n/audit` or `POST /audit/logs`).
- **Live WebSocket Broadcast**: Ingested n8n audit responses automatically broadcast over `/ws/notifications`, immediately triggering live alert banners and patient queue updates on both the Doctor Review Workspace and Doctor Dashboard.

---

## 🔒 Mandatory Mobile OTP Patient Authentication

Direct patient check-in without verification is strictly prevented:
1. **Mandatory 10-Digit Mobile Number**: The `(Optional)` tag has been removed; every registration requires a valid mobile number.
2. **Automated n8n Dispatch**: Clicking **Send OTP** fires the `PATIENT_LOGIN_OTP` event to n8n to send the 6-digit code.
3. **Interactive Verification Card**: A dedicated 6-digit OTP entry card with active 45-second countdown timer and resend controls gates access.
4. **Strict Backend Gate**: `POST /session` rejects any unverified request with `HTTP 400` / `401`. Access to Step 3 (Consent) and Step 4 (Clinical Intake) is unlocked only upon genuine OTP verification.

---

## 🔌 API Endpoints

### Patient Session & OTP Authentication
- `POST /auth/otp/send` — Generate and dispatch 6-digit OTP via n8n automation.
- `POST /auth/otp/verify` — Verify submitted OTP code against active token.
- `POST /session` — Start patient check-in session (**mandatory mobile OTP verification**).
- `POST /session/abha` — Start session via 14-digit ABHA ID & PIN.
- `POST /consent` — Record versioned patient consent (DPDP Act 2023 conformant).
- `GET  /session/{id}` — Retrieve session state and consent status.

### n8n Automation & Webhooks
- `POST /notifications/n8n/test` — Trigger a diagnostic test ping to n8n webhook.
- `POST /notifications/n8n/dispatch` — Dispatch custom notification payloads to n8n.
- `POST /notifications/n8n/escalate` — Manual emergency escalation trigger to n8n.
- `GET  /notifications/n8n/status` — Inspect n8n webhook status and recent delivery logs.
- `GET  /notifications/n8n/audit` — Retrieve complete n8n webhook delivery audit trail.
- `POST /notifications/n8n/audit` — Inbound endpoint for n8n workflow execution post-responses.
- `POST /audit/logs` — Inbound alias for external audit logs and n8n responses.

### Clinical Triage, Intake & AI
- `GET /health` — Check backend and database status.
- `GET /queue/encounters/portal` — Retrieve active patient triage queue.
- `DELETE /queue/encounters/{id}` — Delete / clear a specific patient encounter.
- `DELETE /queue/encounters/clear-all` — Reset entire OPD queue.
- `POST /intake/process-voice-narrative` — Parse 50+ word spoken narrative across 12 organ systems.
- `POST /intake/submit-voice-followup` — Process AI follow-up response and merge newly reported symptoms.
- `POST /ocr/process` — Upload prescription image or PDF for medical OCR and entity extraction.
- `GET /ocr/encounter/{id}` — Retrieve extracted OCR prescription data for an encounter.
- `POST /summary/generate` — Generate Gemini 3.6/3.7 Flash structured clinical summary.
- `GET /fhir/encounter/{id}` — Export encounter as HL7 FHIR R4 JSON document.
- `POST /audit/approve-summary` — Doctor clinical signature and audit logging.
- `POST /audit/override-summary` — Doctor override with rationale and audit record.

---

## 🚀 Production Deployment Guide

Follow this guide to deploy ArogyaLink to production environments (e.g. AWS, Render, Railway, Vercel, Supabase, Docker):

### 1. Environment Configuration Checklist
Copy `.env.example` to `.env` on your production host and configure:
```bash
# Database
DATABASE_URL=postgresql+asyncpg://<db_user>:<db_password>@<db_host>:5432/<db_name>?ssl=require

# Supabase Auth
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_JWT_AUD=authenticated
SUPABASE_ANON_KEY=<production-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<production-service-role-key>

# Environment & CORS (Include your live frontend domains)
APP_ENV=production
APP_VERSION=1.0.0
CORS_ORIGINS=https://kiosk.yourdomain.com,https://doctor.yourdomain.com,https://portal.yourdomain.com

# AI & Government APIs
GEMINI_API_KEY=<your-production-gemini-key>
BHASHINI_API_KEY=<bhashini-api-key>
BHASHINI_USER_ID=<bhashini-user-id>
ABDM_BASE_URL=https://sandbox.abdm.gov.in # Or production ABDM gateway
ABDM_CLIENT_ID=<abdm-client-id>
ABDM_CLIENT_SECRET=<abdm-client-secret>

# n8n Cloud Automation
N8N_WEBHOOK_URL=https://<your-n8n-instance>.app.n8n.cloud/webhook/arogyasetu-notifications
N8N_ENABLED=true
```

> [!CAUTION]
> Never commit `.env` or production credentials to source control. ArogyaLink's `.gitignore` enforces strict exclusion of all `.env*` files.

### 2. Database Migration & Provisioning
Run database migrations using Alembic on your production PostgreSQL instance:
```bash
cd backend
alembic upgrade head
```

### 3. Backend Deployment (Docker / Container Services)
The backend can be containerized or run with production ASGI workers:
```bash
# Production execution with multiple Uvicorn workers behind a reverse proxy (Nginx / Caddy / Cloudflare)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4 --proxy-headers --forwarded-allow-ips="*"
```
Ensure WebSocket support is enabled on your reverse proxy for `/ws/notifications`.

### 4. Frontend Build & Static Hosting
Build production bundles for the three client applications:
```bash
# Patient Kiosk (Vercel / Netlify / S3 + CloudFront)
cd apps/patient-kiosk
npm run build # Outputs to dist/

# Doctor Dashboard
cd ../doctor-dashboard
npm run build # Outputs to dist/

# Central Portal
cd ../portal
npm run build # Outputs to dist/
```
In your production hosting dashboard, set the following environment variables:
- `VITE_API_URL=https://api.yourdomain.com`
- `VITE_WS_URL=wss://api.yourdomain.com/ws/notifications`

### 5. n8n Cloud Webhook Workflow Setup
1. Create a Webhook trigger node in n8n listening for `POST` requests.
2. Route events by `event_type`:
   - `PATIENT_LOGIN_OTP`: Route to SMS gateway (Twilio, Gupshup, or MSG91) or WhatsApp Business API.
   - `EMERGENCY_ESCALATION`: Send high-priority Slack/PagerDuty/Email alerts to senior doctors.
   - `MEDICATION_REMINDER`: Dispatch scheduled reminder messages to patients.
3. Configure the n8n execution response node to send a `POST` callback to `https://api.yourdomain.com/notifications/n8n/audit` or `https://api.yourdomain.com/audit/logs` to log completion in ArogyaLink's live audit dashboard.

---

## 📄 License
This project is licensed under the MIT License.
