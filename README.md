# 🏥 ArogyaLink (आरोग्य लिंक)
> **AI-Powered Multimodal Clinical Triage, Prescription OCR Digitizer & ABDM Decision-Support Ecosystem**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.6%2F3.7_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Bhashini](https://img.shields.io/badge/Bhashini-ULCA_Speech_AI-FF9933.svg)](https://bhashini.gov.in)
[![Indic Languages](https://img.shields.io/badge/Multilingual-7%2B_Indic_Languages-10B981.svg)](#-voice-touch--multilingual-architecture)
[![DPDP Act](https://img.shields.io/badge/Privacy-DPDP_Act_2023_Compliant-0284C7.svg)](#-security-encryption--data-privacy)
[![FHIR R4](https://img.shields.io/badge/HL7_FHIR-R4_Conformant-E31B23.svg)](https://hl7.org/fhir/R4/)
[![ABDM](https://img.shields.io/badge/ABDM-Sandbox_Ready-FF9933.svg)](https://abdm.gov.in)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
- [Voice, Touch & Multilingual Architecture](#-voice-touch--multilingual-architecture)
- [Security, Encryption & Data Privacy](#-security-encryption--data-privacy)
- [UI/UX Design System & Ergonomics](#-uiux-design-system--ergonomics)
- [System Architecture](#-system-architecture)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Local Setup](#-installation--local-setup)
- [One-Click Startup](#-one-click-startup)
- [API Endpoints](#-api-endpoints)
- [Project Directory Structure](#-project-directory-structure)
- [License](#-license)

---

## 🌟 Overview

**ArogyaLink** is a comprehensive clinical decision-support and patient triage platform tailored for high-volume Indian Outpatient Departments (OPDs), rural health centers, and modern hospitals. 

It bridges the gap between fast multilingual patient intake and doctor workflow by providing:
1. **Multimodal Patient Check-in**: Regional Indian voice recognition and touch-first kiosk questionnaire with DPDP Act 2023 compliant digital consent.
2. **Authentic Prescription & Lab OCR**: Real document entity extraction using **Gemini Multimodal Vision**, **PyMuPDF**, and **BioClinical-NER**.
3. **Traceable AI Clinical Summaries**: Powered by **Gemini 3.6/3.7 Flash** and **Groq Llama-3.3-70b**, delivering **1-sentence Quick Doctor Snapshots**, **Plain-Language Patient Explanations**, and clinical differential diagnoses.
4. **Contradiction Detection Engine**: Automatically identifies logical mismatches between reported symptoms and uploaded prescription medications.
5. **Doctor-in-the-Loop Oversight**: Clinical review dashboard with audit logs, overrides, and **HL7 FHIR R4** export to Ayushman Bharat Digital Mission (ABDM).

---

## 🚀 Key Features & Modules

### 1. 🩺 Doctor Clinical Dashboard (`http://localhost:5174`)
- **Live Triaged Queue**: Real-time prioritization of incoming encounters into `CRITICAL`, `URGENT`, and `ROUTINE`.
- **Traceable Clinical Synthesis**:
  - **⚡ Quick Doctor Snapshot**: 1-sentence high-yield summary for instant doctor grasp.
  - **🗣️ Patient-Friendly Explanation**: Clear plain-language explanation without confusing medical jargon.
  - **Structured Differentials**: Likelihood badges (`High`, `Moderate`, `Low`) with clinical rationales.
  - **Action Checklist**: Recommended vitals check, 12-lead ECG, and priority lab orders.
- **Rx OCR Sub-tab**: Visualizes detected medications (`dosage`, `frequency`, `duration`), diagnostic lab tables, and verbatim raw transcribed text.
- **🌿 AYUSH Dashavidha Module**: Integrates traditional Ayurvedic Prakriti, Agni, and Ahara-Vihara assessments.
- **🔍 Contradiction Validation**: Cross-checks patient symptoms against OCR prescription records to prevent medical errors.
- **⏰ Automated Reminders**: Schedules WhatsApp and SMS medication reminders.
- **Doctor Oversight**: Approve & sign records with SHA-256 audit logs, rationale overrides, and ABHA ID linkage.

### 2. 📱 Multilingual Patient Touch & Voice Kiosk (`http://localhost:5173`)
- **Touch-First Self-Service Intake**: Large high-contrast touch targets, visual symptom selector tiles, and low-literacy friendly layout designed for busy OPD waiting rooms.
- **🎙️ Real-Time Regional Voice Input**: Web Speech API & Bhashini ULCA speech-to-text with live audio waveform visualization and interim transcription.
- **🔊 Multilingual Text-to-Speech (TTS)**: Reads questions aloud in native regional languages to guide illiterate or elderly patients.
- **🌐 7+ Indian Languages**: Instant switching between Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam, and English.
- **📄 Document & Prescription Scanner**: Upload camera photos or PDFs of old prescriptions and lab reports for instant on-kiosk entity preview.
- **🪪 ABHA ID & DPDP Consent**: Seamless ABHA authentication and DPDP Act 2023 compliant digital consent capture prior to clinical intake.

### 3. 🌐 Unified Showcase Portal (`http://localhost:5175`)
- Interactive doctor-patient workflow demo with dual-screen simulation.
- Live queue inspection, FHIR R4 JSON bundle viewer, and responsive architecture showcase.

---

## 🗣️ Voice, Touch & Multilingual Architecture

ArogyaLink is designed from the ground up for Indian public health realities:

| Capability | Implementation & Technology | Highlights |
| :--- | :--- | :--- |
| **Speech-to-Text (ASR / STT)** | Web Speech API (`webkitSpeechRecognition`) + Bhashini ULCA ASR (`dhruva-api.bhashini.gov.in`) | Continuous interim transcription, auto speech detection, and graceful offline fallback |
| **Voice Synthesis (TTS)** | Web Speech Synthesis API (`window.speechSynthesis`) | Reads clinical questions, options, and consent prompts in regional accents |
| **Languages Supported** | Hindi (`hi-IN`), Bengali (`bn-IN`), Tamil (`ta-IN`), Telugu (`te-IN`), Marathi (`mr-IN`), Gujarati (`gu-IN`), Kannada (`kn-IN`), Malayalam (`ml-IN`), English (`en-IN`) | Full Indic script typography & localized symptom ontology |
| **Touchscreen UX** | Ergonomic touch design (min 48px touch targets), single-tap symptom chips, accessible high-contrast UI | Zero typing required; fully operable via touch taps or voice dictation |
| **i18n Translation Engine** | Dynamic client dictionary (`i18n.js`) + backend localized ontology | Instant client-side language switching without page reload |

---

## 🔒 Security, Encryption & Data Privacy

Patient confidentiality and regulatory compliance are integral to the system design:

- **🔐 End-to-End Encryption in Transit**: All communications across REST APIs and WebSockets are secured via TLS 1.3 / HTTPS encryption.
- **📜 DPDP Act 2023 Compliant Consent**: Multi-stage explicit digital consent before data capture, including multilingual notices, purpose limitation, and patient revocation support.
- **🛡️ Immutable Medico-Legal Audit Trail**: Every doctor action (approvals, rationale overrides, clinical edits) is logged with SHA-256 integrity, UTC timestamps, and physician IDs.
- **🪪 ABHA & ABDM Privacy Boundaries**: Complies with Ayushman Bharat Digital Mission M1/M2/M3 privacy guidelines with tokenized patient health identifiers.
- **🏥 FHIR R4 Data Integrity**: Patient encounters, observations, and prescription records are formatted as strictly validated HL7 FHIR R4 JSON bundles.
- **🛡️ Environment & CORS Security**: Strict domain origin whitelisting (`CORS_ORIGINS`) and secret isolation via Pydantic BaseSettings.

---

## 🎨 UI/UX Design System & Ergonomics

ArogyaLink features an editorial, human-centered clinical design system engineered for both chaotic rural OPD kiosks and focused doctor workstations:

- **Warm Editorial Theme**: Replaces sterile hospital greys with an organic, calming Warm Linen and Cream palette (`#FAF7F2`, `#FAF6F0`, `#12322B`, `#2E1B15`) that reduces screen glare and visual fatigue.
- **Editorial Typography Hierarchy**:
  - **Headers**: Sophisticated editorial serif (*Fraunces* / *Newsreader*) for clear visual anchor points.
  - **Body & Data**: High-legibility modern sans-serif (*Plus Jakarta Sans* / *Inter*) for optimal readability of medical dosages and laboratory values.
- **OPD Touch Ergonomics**:
  - Minimum **48px–56px** tap targets optimized for capacitive touchscreens and tremors.
  - Preset symptom selection chips enabling one-touch clinical entry without on-screen typing.
  - Dynamic audio feedback waveforms indicating microphone activity in noisy OPD environments.
- **Clinical Triage Visual Hierarchy**:
  - Instant status badges: `CRITICAL` (High-contrast crimson), `URGENT` (Warm amber), `ROUTINE` (Calm emerald).
  - Split-pane layout: Simultaneous viewing of AI diagnostic synthesis alongside original scanned prescription documents.
  - Custom micro-scrollbars and tactile hover transitions (`hover:scale-[1.01]`, `active:scale-[0.99]`).

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
│  - DPDP Consent Record  │       │   - OCR Parser (NER)   │       │ - Audit & Overrides    │
│  - Prescription Upload  │       │   - Contradiction Eng  │       │ - FHIR R4 & ABHA Link  │
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
- **Voice & Speech Recognition (STT)**: Web Speech API (`SpeechRecognition`) with continuous audio stream + Bhashini ULCA ASR Pipeline (`dhruva-api.bhashini.gov.in`) with local resilient fallback
- **Voice Synthesis (TTS)**: Web Speech Synthesis API (`SpeechSynthesisUtterance`) for automated regional audio question reading
- **Multilingual Localization (i18n)**: Indic translation engine supporting Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Kannada, Malayalam & English
- **Document OCR & Clinical NER**: PyMuPDF (`pymupdf`), Pillow, PaddleOCR, Regex Medical NER

### Security, Privacy & Interoperability
- **Data Protection**: DPDP Act 2023 Digital Consent Engine, TLS 1.3 in-transit data encryption
- **Audit & Governance**: SHA-256 hashed doctor approval/override audit logger (`AuditService`)
- **Health Standards**: HL7 FHIR R4 Bundle Generator, ABDM Sandbox Integration (ABHA M1/M2/M3)
- **API Guardrails**: Strict CORS whitelisting, Pydantic v2 input sanitization, async non-blocking pipelines

### Backend
- **Framework**: Python 3.13+, FastAPI 0.115
- **Server**: Uvicorn (ASGI) with real-time WebSocket notifications
- **Database & ORM**: PostgreSQL / Supabase, SQLAlchemy 2.0 (AsyncPG), Alembic migrations

### Frontend, UI/UX & Kiosk
- **Framework**: React 19.2, React Router v7
- **Build Tool**: Vite 8.2 & Vite 6.4
- **Design Tokens & Styling**: TailwindCSS v4 with `@layer base` Warm Linen & Cream Organic theme
- **Typography**: Google Fonts (*Fraunces*, *Newsreader*, *Plus Jakarta Sans*, *Inter*)
- **Icons & Visuals**: Lucide-React, custom animated waveform indicators
- **Touchscreen Ergonomics**: Minimum 48px touch targets, single-tap preset symptom chips, touch keypad/selectors, and visual audio waveforms
- **Realtime**: WebSockets, Web Speech API, Native Camera Capture

---

## 📋 Prerequisites

Before running ArogyaLink locally, ensure you have the following installed:
1. **Python 3.10+** (Recommended: Python 3.12 or 3.13)
2. **Node.js 18+** and **npm**
3. **Git**

---

## ⚙️ Installation & Local Setup

### Step 1: Clone the Repository
```bash
git clone https://github.com/Shrinivas1908/ArogyaLink.git
cd ArogyaLink
```

### Step 2: Configure Environment Variables
Copy `.env.example` in the backend directory to `.env`:
```bash
cp .env.example backend/.env
```
Ensure your `backend/.env` file contains your Google Gemini API key:
```env
GEMINI_API_KEY=your_gemini_api_key_here
DATABASE_URL=postgresql+asyncpg://arogya:arogya_pass@localhost:5432/arogya_link
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175
```

### Step 3: Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
cd ..
```

### Step 4: Install Frontend Dependencies
Install dependencies for each frontend app:
```bash
# 1. Patient Kiosk
cd apps/patient-kiosk
npm install
cd ../..

# 2. Doctor Dashboard
cd apps/doctor-dashboard
npm install
cd ../..

# 3. Unified Portal
cd apps/portal
npm install
cd ../..
```

---

## ⚡ One-Click Startup

### Option A: Using Windows Batch Script (Recommended)
Double-click `start_stack.bat` or run in terminal:
```cmd
start_stack.bat
```

### Option B: Running Individual Services Manually

**Terminal 1 — Backend FastAPI:**
```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Patient Kiosk:**
```bash
cd apps/patient-kiosk
npm run dev
```

**Terminal 3 — Doctor Dashboard:**
```bash
cd apps/doctor-dashboard
npm run dev
```

**Terminal 4 — Doctor-Patient Portal:**
```bash
cd apps/portal
npm run dev
```

---

## 🌐 Localhost Port Mappings

| Service | Localhost URL | Description |
| :--- | :--- | :--- |
| **Backend API** | `http://localhost:8000` | FastAPI docs at `http://localhost:8000/docs` |
| **Backend Health** | `http://localhost:8000/health` | Live database and service health check |
| **Patient Kiosk** | `http://localhost:5173` | Touch & voice self-service intake kiosk in 7+ Indian languages |
| **Doctor Dashboard** | `http://localhost:5174` | Doctor triage, clinical AI synthesis, and Rx OCR review |
| **Unified Portal** | `http://localhost:5175` | Interactive doctor-patient showcase workspace |

---

## 🔌 API Endpoints

- `GET /health` — Check backend and database status.
- `GET /queue/encounters/portal` — Retrieve active patient triage queue.
- `GET /queue/encounter/{id}/portal` — Retrieve full clinical review bundle with AI summary and OCR data.
- `POST /ocr/process` — Upload prescription image or PDF for medical OCR and entity extraction.
- `GET /ocr/encounter/{id}` — Retrieve cached OCR extraction results for encounter.
- `POST /summary/generate` — Generate Gemini 3.6/3.7 Flash structured clinical summary.
- `POST /voice/transcribe` — Transcribe regional Indian language voice audio via Bhashini / local ASR engine.
- `GET /voice/languages` — List supported Indian voice languages and metadata.
- `GET /fhir/encounter/{id}` — Export encounter as HL7 FHIR R4 JSON document.
- `POST /audit/approve-summary` — Doctor clinical signature and audit logging.

---

## 📁 Project Directory Structure

```
ArogyaLink/
├── apps/
│   ├── doctor-dashboard/       # Doctor triage & review dashboard (React + Vite, Port 5174)
│   │   ├── src/
│   │   │   ├── components/     # EncounterDetail, PatientQueue, MetricStats, etc.
│   │   │   └── pages/          # Dashboard.jsx
│   │   └── package.json
│   ├── patient-kiosk/          # Multilingual intake kiosk (React + Vite, Port 5173)
│   │   ├── src/
│   │   │   └── components/     # IntakeQuestionnaire, ConsentModal, etc.
│   │   └── package.json
│   └── portal/                 # Unified showcase portal (React + Vite, Port 5175)
│       └── src/
│           └── components/     # InteractiveDoctorWorkspace, RoleShowcase, etc.
├── backend/
│   ├── app/
│   │   ├── api/v1/             # FastAPI routers (queue, ocr, summary, triage, fhir, etc.)
│   │   ├── core/               # Database connection, settings, auth dependencies
│   │   ├── engines/            # Contradiction Engine, Question Engine, Triage Rules
│   │   ├── integrations/       # GeminiClient (3.6/3.7 Flash), PaddleOCRClient (Vision + NER)
│   │   ├── models/             # SQLAlchemy ORM models (Patient, Encounter, Consent, Answer)
│   │   └── services/           # OCRService, LLMService
│   ├── main.py                 # FastAPI application factory
│   └── requirements.txt        # Python dependencies
├── start_stack.bat             # One-click startup script for all services
├── docker-compose.yml          # PostgreSQL & Redis container config
├── .gitignore
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
