import React, { useState } from 'react'
import InteractivePatientKiosk from './InteractivePatientKiosk'
import InteractiveDoctorWorkspace from './InteractiveDoctorWorkspace'

export default function RoleShowcase() {
  const [activeRole, setActiveRole] = useState('patient')

  return (
    <section id="features" className="py-16 px-6 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] font-bold px-3 py-1 bg-white border border-[#E4EDE9] text-[#12322B] rounded-full uppercase tracking-widest">
          ✦ UNIFIED CLINICAL WORKSPACES
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif text-[#12322B]">
          Explore Patient & Doctor Experiences
        </h2>
        <p className="text-[#5F7D74] text-sm max-w-xl mx-auto">
          Switch roles below to interact with live patient intake kiosks and real-time clinical review queues inside this portal.
        </p>

        {/* Role Switcher Pill */}
        <div className="inline-flex p-1.5 rounded-full bg-white border border-[#E4EDE9] shadow-sm">
          <button
            onClick={() => setActiveRole('patient')}
            className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeRole === 'patient'
                ? 'bg-[#12322B] text-white shadow-md'
                : 'text-[#5F7D74] hover:text-[#12322B]'
            }`}
          >
            Patient Kiosk Experience
          </button>
          <button
            onClick={() => setActiveRole('doctor')}
            className={`px-6 py-2.5 rounded-full font-bold text-xs uppercase tracking-wider transition-all ${
              activeRole === 'doctor'
                ? 'bg-[#12322B] text-white shadow-md'
                : 'text-[#5F7D74] hover:text-[#12322B]'
            }`}
          >
            Doctor Clinical Workspace
          </button>
        </div>
      </div>

      {/* Patient View Interactive */}
      {activeRole === 'patient' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#BFD8D2] text-[#12322B] flex items-center justify-center font-serif font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">Instant Check-In & Consent</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Touchscreen demographic registration and versioned digital consent recording anchored to server-issued encounter IDs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#BFD8D2] text-[#12322B] flex items-center justify-center font-serif font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">Adaptive Question Engine</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Dynamically tailors clinical questions based on patient symptom answers. Pure server-side branching without hallucination.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#BFD8D2] text-[#12322B] flex items-center justify-center font-serif font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">Voice & Document OCR</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Speak in regional Indian languages with browser Web Speech or upload old prescription photos for verified OCR extraction.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <InteractivePatientKiosk />
          </div>
        </div>
      )}

      {/* Doctor View Interactive */}
      {activeRole === 'doctor' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E4EDE9] text-[#2E1B15] flex items-center justify-center font-serif font-bold text-sm">
                A
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">Real-Time Triage Queue</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Live patient queue sorted by deterministic red-flag severity. Instant WebSocket alerts push critical cases to clinician focus.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E4EDE9] text-[#2E1B15] flex items-center justify-center font-serif font-bold text-sm">
                B
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">AI Summary & Audit</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Structured Gemini AI clinical summaries with strict Pydantic validation. Full edit, override, and doctor signature audit logging.
              </p>
            </div>

            <div className="bg-white p-6 rounded-[24px] border border-[#E4EDE9] space-y-3 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-[#FAF6F0] border border-[#E4EDE9] text-[#2E1B15] flex items-center justify-center font-serif font-bold text-sm">
                C
              </div>
              <h3 className="text-lg font-serif text-[#12322B]">FHIR & ABHA Ecosystem</h3>
              <p className="text-[#5F7D74] text-xs leading-relaxed">
                Standard HL7 FHIR JSON bundle export and instant 14-digit ABHA card linking for Ayushman Bharat Digital Mission compliance.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <InteractiveDoctorWorkspace />
          </div>
        </div>
      )}
    </section>
  )
}
