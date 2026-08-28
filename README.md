# 🏥 ArogyaLink (आरोग्य लिंक)
> **AI-Powered Multimodal Clinical Triage, Prescription OCR Digitizer & ABDM Decision-Support Ecosystem**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.2-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Gemini](https://img.shields.io/badge/Google_Gemini-3.6%2F3.7_Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![FHIR R4](https://img.shields.io/badge/HL7_FHIR-R4_Conformant-E31B23.svg)](https://hl7.org/fhir/R4/)
[![ABDM](https://img.shields.io/badge/ABDM-Sandbox_Ready-FF9933.svg)](https://abdm.gov.in)

---

## 📖 Table of Contents
- [Overview](#-overview)
- [Key Features & Modules](#-key-features--modules)
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
1. **Multimodal Patient Check-in**: Regional Indian voice and touch questionnaire with DPDP Act 2023 compliant digital consent.
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

### 2. 📱 Multilingual Patient Kiosk (`http://localhost:5173`)
- **Self-Service Check-in**: Intuitive touch UI with large buttons and regional language voice assistance.
- **Document & Prescription Scanner**: Upload camera photos or PDFs of old prescriptions and lab reports.
- **Instant Entity Extraction**: Displays extracted medications and abnormal lab flags directly on the kiosk.
- **Consent Capture**: DPDP Act 2023 compliant consent record before intake.

### 3. 🌐 Unified Showcase Portal (`http://localhost:5175`)
- Interactive doctor-patient workflow demo.
- Live queue inspection, FHIR R4 JSON bundle viewer, and responsive architecture showcase.

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
│  - Touch / Voice Intake │       │   Port 8000            │       │ - Severity Triage      │
│  - Prescription Upload  │ ◄───  │   - OCR Parser (NER)   │ ◄───  │ - AI Synthesis (HPI)   │
└─────────────────────────┘       │   - Contradiction Eng  │       │ - FHIR R4 & ABHA Link  │
                                  │   - Queue & FHIR API   │       └────────────────────────┘
┌─────────────────────────┐       └───────────▲────────────┘
│  Unified Portal (5175)  │ ──────────────────┘
└─────────────────────────┘
```

---

## 💻 Tech Stack

### Backend
- **Framework**: Python 3.13+, FastAPI 0.115
- **Server**: Uvicorn (ASGI) with WebSocket notifications
- **Database & ORM**: PostgreSQL / Supabase, SQLAlchemy 2.0 (AsyncPG), Alembic migrations
- **Document OCR & Parsing**: PyMuPDF (`pymupdf`), Pillow, PaddleOCR, Regex Medical NER
- **AI & LLM Client**: Google Gemini 3.6/3.7 Flash Multimodal API, Groq Llama-3.3-70b, Pydantic v2
- **Interoperability**: HL7 FHIR R4 Bundle Generator, ABDM Sandbox Integration

### Frontend
- **Framework**: React 19.2, React Router v7
- **Build Tool**: Vite 8.2 & Vite 6.4
- **Styling**: TailwindCSS v4 with modern clinical design tokens
- **Realtime**: WebSockets, Web Speech API for voice synthesis

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
| **Patient Kiosk** | `http://localhost:5173` | Touch & voice self-service intake kiosk |
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
