import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import Hero from './components/Hero'
import RoleShowcase from './components/RoleShowcase'
import TeleConsultationWidget from './components/TeleConsultationWidget'
import SymptomTriageWidget from './components/SymptomTriageWidget'
import HealthPassWidget from './components/HealthPassWidget'
import PatientHealthLocker from './components/PatientHealthLocker'
import VoiceHealthAssistant from './components/VoiceHealthAssistant'
import InteractivePatientKiosk from './components/InteractivePatientKiosk'
import InteractiveDoctorWorkspace from './components/InteractiveDoctorWorkspace'
import Footer from './components/Footer'

export default function App() {
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#kiosk') return 'kiosk'
      if (window.location.hash === '#doctor') return 'doctor'
    }
    return 'portal'
  })

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#kiosk') setActiveView('kiosk')
      else if (window.location.hash === '#doctor') setActiveView('doctor')
      else setActiveView('portal')
    }
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="min-h-screen bg-sky-50/50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <Header activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1">
        {/* View 1: Dedicated Full-Screen Patient Kiosk */}
        {activeView === 'kiosk' && (
          <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-sky-100 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-sky-100 text-sky-700 rounded-xl text-lg">📲</span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Dedicated Patient Kiosk</h2>
                  <p className="text-xs text-slate-500">Autonomous touchscreen check-in with mandatory OTP & AI clinical intake</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveView('portal')
                  window.location.hash = ''
                }}
                className="text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 px-3.5 py-2 rounded-xl transition"
              >
                ← Back to Overview
              </button>
            </div>
            <InteractivePatientKiosk />
          </div>
        )}

        {/* View 2: Dedicated Full-Screen Doctor Workspace */}
        {activeView === 'doctor' && (
          <div className="py-8 px-4 sm:px-6 max-w-7xl mx-auto space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-emerald-100 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl text-lg">🩺</span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Dedicated Doctor Clinical Workspace</h2>
                  <p className="text-xs text-slate-500">Live triage queue, Gemini AI CoT summaries, FHIR export & n8n real-time alerts</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveView('portal')
                  window.location.hash = ''
                }}
                className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-2 rounded-xl transition"
              >
                ← Back to Overview
              </button>
            </div>
            <InteractiveDoctorWorkspace />
          </div>
        )}

        {/* View 3: Complete Unified Portal */}
        {activeView === 'portal' && (
          <div className="space-y-12 animate-fadeIn">
            <Hero />
            <PatientHealthLocker />
            <RoleShowcase />
            <TeleConsultationWidget />
            <SymptomTriageWidget />
            <HealthPassWidget />
          </div>
        )}
      </main>

      <VoiceHealthAssistant />
      <Footer />
    </div>
  )
}
