import React, { useState } from 'react'
import InteractivePatientKiosk from './InteractivePatientKiosk'
import InteractiveDoctorWorkspace from './InteractiveDoctorWorkspace'

export default function RoleShowcase() {
  const [activeRole, setActiveRole] = useState('patient')

  return (
    <section id="features" className="py-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold px-3 py-1 bg-sky-100 border border-sky-300 text-sky-800 rounded-full uppercase tracking-widest">
          Unified Interactive Healthcare Workspaces
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">
          Integrated Doctor & Patient Platform
        </h2>
        <p className="text-slate-600">
          Switch roles below to interact with live patient intake kiosks and real-time clinical review queues inside this main portal window.
        </p>

        {/* Role Switcher Pill */}
        <div className="inline-flex p-1.5 rounded-2xl bg-white border border-sky-200 shadow-md">
          <button
            onClick={() => setActiveRole('patient')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeRole === 'patient'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            Patient Kiosk Intake Mode
          </button>
          <button
            onClick={() => setActiveRole('doctor')}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${
              activeRole === 'doctor'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/25'
                : 'text-slate-600 hover:text-sky-600'
            }`}
          >
            Doctor Review Workspace Mode
          </button>
        </div>
      </div>

      {/* Patient View Interactive */}
      {activeRole === 'patient' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg">
                01
              </div>
              <h3 className="text-lg font-bold text-slate-900">Instant Check-In & Consent</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Touchscreen demographic registration and versioned digital consent recording anchored to server-issued encounter IDs.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg">
                02
              </div>
              <h3 className="text-lg font-bold text-slate-900">Adaptive Question Engine</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Dynamically tailors clinical questions based on patient symptom answers. Pure server-side branching without external AI dependency.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-lg">
                03
              </div>
              <h3 className="text-lg font-bold text-slate-900">Voice & Document OCR</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Speak in regional Indian languages with Bhashini STT or upload old prescription photos for PaddleOCR extraction.
              </p>
            </div>
          </div>

          {/* Live Patient Kiosk Component */}
          <div className="pt-4">
            <InteractivePatientKiosk />
          </div>
        </div>
      )}

      {/* Doctor View Interactive */}
      {activeRole === 'doctor' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                A
              </div>
              <h3 className="text-lg font-bold text-slate-900">Real-Time Triage Queue</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Live patient queue sorted by deterministic red-flag severity. Instant WebSocket alerts push critical cases to the top.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                B
              </div>
              <h3 className="text-lg font-bold text-slate-900">Gemini Summary & Audit</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Structured Gemini AI clinical summaries with strict Pydantic validation. Full edit, override, and doctor approval audit logging.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-3 bg-white/90">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                C
              </div>
              <h3 className="text-lg font-bold text-slate-900">AYUSH & FHIR Export</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Integrative AYUSH assessment modules and standard FHIR JSON bundle export for ABDM ecosystem compatibility.
              </p>
            </div>
          </div>

          {/* Live Doctor Workspace Component */}
          <div className="pt-4">
            <InteractiveDoctorWorkspace />
          </div>
        </div>
      )}
    </section>
  )
}
