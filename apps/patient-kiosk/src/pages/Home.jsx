import { useState, useEffect } from 'react'
import Header from '../components/Header'
import IntakeQuestionnaire from '../components/IntakeQuestionnaire'

/**
 * Patient Kiosk — Home Page (Phase 4: Adaptive Clinical Intake)
 * Styled with exact Main Portal Light White & Sky Blue Design System
 */
export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [step, setStep] = useState('landing') // 'landing' | 'demographics' | 'consent' | 'active'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
  })

  // Session state
  const [session, setSession] = useState(null)
  const [consentRecorded, setConsentRecorded] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'connected' : 'degraded'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const handleStartDemographics = () => {
    setError(null)
    setStep('demographics')
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.fullName.trim() || null,
          age: formData.age ? parseInt(formData.age, 10) : null,
          gender: formData.gender,
          phone: formData.phone.trim() || null,
          kiosk_id: 'kiosk-01',
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to start session')
      }

      const data = await res.json()
      setSession(data)
      setStep('consent')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordConsent = async (accept) => {
    if (!session?.encounter_id) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: session.encounter_id,
          consented: accept,
          consent_version: 'v1.0',
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to record consent')
      }

      if (accept) {
        setConsentRecorded(true)
        setStep('active')
      } else {
        setError('Consent is required to proceed with clinical triage.')
        setStep('landing')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-sky-50/50 text-slate-800 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Step 1: Landing Hero Card (Main Portal Style) */}
        {step === 'landing' && (
          <div className="space-y-8">
            <div className="relative glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden shadow-sm border border-sky-100 text-center space-y-6">
              
              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold shadow-sm">
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                Backend API: {backendStatus.toUpperCase()}
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
                Smart Patient Intake & <span className="bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">Clinical Triage Kiosk</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                Touchscreen & Voice-enabled adaptive clinical check-in. Seamlessly records symptoms, evaluates emergency red-flags & links ABHA cards.
              </p>

              <div className="pt-4">
                <button
                  onClick={handleStartDemographics}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-lg shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  Begin Patient Check-In →
                </button>
              </div>

              {/* Feature Grid Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-sky-100 max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center">
                  <span className="text-2xl mb-1 block">🎙️</span>
                  <span className="text-xs font-bold text-slate-900 block">7 Languages Voice</span>
                  <span className="text-[10px] text-slate-500">Bhashini Speech-to-Text</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center">
                  <span className="text-2xl mb-1 block">🚨</span>
                  <span className="text-xs font-bold text-slate-900 block">Red-Flag Triage</span>
                  <span className="text-[10px] text-slate-500">Deterministic Safety Engine</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center">
                  <span className="text-2xl mb-1 block">🤖</span>
                  <span className="text-xs font-bold text-slate-900 block">Gemini 2.5 AI</span>
                  <span className="text-[10px] text-slate-500">Clinical Summaries</span>
                </div>
                <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center">
                  <span className="text-2xl mb-1 block">📄</span>
                  <span className="text-xs font-bold text-slate-900 block">ABDM & FHIR</span>
                  <span className="text-[10px] text-slate-500">HL7 R4 Bundle Export</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Demographics Form */}
        {step === 'demographics' && (
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step 1 of 3</span>
              <h2 className="text-2xl font-bold text-slate-900">Patient Check-In</h2>
              <p className="text-xs text-slate-500">Please enter your basic information to begin intake.</p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age</label>
                  <input
                    type="number"
                    placeholder="34"
                    className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-md shadow-sky-500/25 transition disabled:opacity-50"
              >
                {loading ? 'Creating Session…' : 'Continue to Consent →'}
              </button>
            </form>
          </div>
        )}

        {/* Step 3: Consent Record */}
        {step === 'consent' && (
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl text-center">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step 2 of 3</span>
              <h2 className="text-2xl font-bold text-slate-900">Digital Clinical Consent</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                ArogyaLink securely processes your reported intake symptoms for clinical triage and doctor review under National Health Data Management policies.
              </p>
            </div>

            <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs text-slate-700 text-left space-y-2">
              <p>• Your health responses are shared directly with on-duty physicians.</p>
              <p>• Data is encrypted in transit and exported in HL7 FHIR R4 standard.</p>
              <p>• You may withdraw consent at any point during consultation.</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleRecordConsent(false)}
                className="flex-1 py-3.5 rounded-xl border border-sky-200 text-slate-600 hover:bg-sky-50 font-bold text-sm transition"
              >
                Decline
              </button>
              <button
                onClick={() => handleRecordConsent(true)}
                className="flex-1 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition"
              >
                Accept & Begin Intake →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Active Adaptive Intake Questionnaire */}
        {step === 'active' && session && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setStep('landing')
                  setSession(null)
                  setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
                }}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-600 hover:bg-sky-50 transition"
              >
                ← Restart Intake
              </button>
            </div>
            <IntakeQuestionnaire
              encounterId={session.encounter_id}
              onComplete={() => console.log('Intake completed')}
              onRestart={() => {
                setStep('landing')
                setSession(null)
                setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
              }}
            />
          </div>
        )}

      </main>
    </div>
  )
}

