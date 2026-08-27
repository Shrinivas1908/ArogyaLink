import { useState } from 'react'

export default function RoleShowcase() {
  const [activeRole, setActiveRole] = useState('patient')

  return (
    <section id="features" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Designed for Every Healthcare Stakeholder
        </h2>
        <p className="text-slate-400">
          Switch roles below to explore specialized workflows tailored for patients at kiosk check-in and doctors at the clinical review desk.
        </p>

        {/* Role Switcher Pill */}
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
          <button
            onClick={() => setActiveRole('patient')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeRole === 'patient'
                ? 'bg-teal-500 text-slate-950 shadow-lg shadow-teal-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Patient Kiosk Experience
          </button>
          <button
            onClick={() => setActiveRole('doctor')}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeRole === 'doctor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Doctor Clinical Portal
          </button>
        </div>
      </div>

      {/* Patient View Features */}
      {activeRole === 'patient' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl">
              01
            </div>
            <h3 className="text-xl font-bold text-white">Instant Check-In & Consent</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Touchscreen demographic registration and versioned digital consent recording anchored to server-issued encounter IDs.
            </p>
            <span className="inline-block text-xs text-teal-400 font-semibold uppercase tracking-wider">
              Phase 3 Implementation ✓
            </span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl">
              02
            </div>
            <h3 className="text-xl font-bold text-white">Adaptive Question Engine</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Dynamically tailors clinical questions based on patient symptom answers. Pure server-side branching without external AI dependency.
            </p>
            <span className="inline-block text-xs text-teal-400 font-semibold uppercase tracking-wider">
              Phase 4 Core Engine
            </span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xl">
              03
            </div>
            <h3 className="text-xl font-bold text-white">Voice & Document OCR</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Speak in regional Indian languages with Bhashini/Whisper STT or upload old prescription photos for PaddleOCR medical extraction.
            </p>
            <span className="inline-block text-xs text-teal-400 font-semibold uppercase tracking-wider">
              Multilingual & Vision Ready
            </span>
          </div>

        </div>
      )}

      {/* Doctor View Features */}
      {activeRole === 'doctor' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
          
          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
              A
            </div>
            <h3 className="text-xl font-bold text-white">Real-Time Triage Queue</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Live patient queue sorted by deterministic red-flag severity. Instant WebSocket alerts push critical cases to the top.
            </p>
            <span className="inline-block text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Phase 6–7 Dashboard
            </span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
              B
            </div>
            <h3 className="text-xl font-bold text-white">Gemini Summary & Audit</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Structured Gemini AI clinical summaries with strict Pydantic validation. Full edit, override, and doctor approval audit logging.
            </p>
            <span className="inline-block text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              Phase 10 Engine
            </span>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xl">
              C
            </div>
            <h3 className="text-xl font-bold text-white">AYUSH & FHIR Export</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Integrative AYUSH assessment modules and standard FHIR JSON bundle export for ABDM ecosystem compatibility.
            </p>
            <span className="inline-block text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              ABDM & Ayush Standard
            </span>
          </div>

        </div>
      )}
    </section>
  )
}
