import { useState, useEffect } from 'react'

/**
 * Patient Kiosk — Home Page (Phase 3: Patient Session & Consent)
 * Manages kiosk check-in flow: Landing -> Demographics -> Consent -> Active Session.
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
  const [session, setSession] = useState(null) // { encounter_id, patient_id, status }
  const [consentRecorded, setConsentRecorded] = useState(false)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'connected' : 'degraded'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const statusColor = {
    checking: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    degraded: 'bg-orange-100 text-orange-800',
    offline: 'bg-red-100 text-red-800',
  }[backendStatus]

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
        alert('Consent declined. Your session has been cancelled.')
        handleReset()
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep('landing')
    setSession(null)
    setConsentRecorded(false)
    setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
    setError(null)
  }

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-8 max-w-2xl mx-auto w-full">
      {/* Backend health indicator */}
      <div className={`text-xs font-medium px-3 py-1 rounded-full mb-6 ${statusColor}`}>
        Backend: {backendStatus}
      </div>

      {error && (
        <div className="w-full mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl text-center">
          {error}
        </div>
      )}

      {/* STEP 1: LANDING */}
      {step === 'landing' && (
        <div className="flex flex-col items-center text-center gap-6 w-full">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-800 mb-2">Welcome to Arogya Link</h1>
            <p className="text-slate-500 text-lg">Smart Patient Intake Kiosk</p>
          </div>

          <div className="flex gap-3 flex-wrap justify-center my-2">
            {['English', 'हिंदी', 'বাংলা', 'தமிழ்', 'తెలుగు'].map((lang) => (
              <button
                key={lang}
                className="px-4 py-2.5 rounded-xl border-2 border-blue-200 bg-white text-slate-700 text-base font-medium hover:border-blue-500 hover:bg-blue-50 transition min-w-[90px]"
              >
                {lang}
              </button>
            ))}
          </div>

          <button
            id="btn-start-session"
            className="w-full max-w-md bg-blue-700 hover:bg-blue-800 text-white text-xl font-semibold px-8 py-4 rounded-2xl shadow-lg transition"
            onClick={handleStartDemographics}
          >
            Begin Patient Check-In →
          </button>
        </div>
      )}

      {/* STEP 2: DEMOGRAPHICS */}
      {step === 'demographics' && (
        <form onSubmit={handleCreateSession} className="w-full bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-2xl font-bold text-slate-800 text-center">Patient Information</h2>
          <p className="text-sm text-slate-500 text-center mb-4">Please enter basic details to start your session.</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name (Optional)</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Rahul Sharma"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Years"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number (Optional)</label>
            <input
              type="tel"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              className="w-1/3 py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition"
              onClick={() => setStep('landing')}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-xl font-semibold shadow transition disabled:opacity-50"
            >
              {loading ? 'Creating Session…' : 'Continue to Consent →'}
            </button>
          </div>
        </form>
      )}

      {/* STEP 3: CONSENT */}
      {step === 'consent' && (
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 space-y-5">
          <div className="text-center">
            <span className="text-xs font-semibold px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full">
              Consent Agreement v1.0
            </span>
            <h2 className="text-2xl font-bold text-slate-800 mt-2">Patient Consent Form</h2>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600 leading-relaxed space-y-2 max-h-56 overflow-y-auto">
            <p className="font-medium text-slate-800">By continuing, you agree to the following terms:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Your intake answers, uploaded documents, and voice responses will be recorded for clinical review.</li>
              <li>Your data will be securely processed by the ArogyaLink system and shared only with authorized clinical staff.</li>
              <li>You may request session cancellation at any time before final review.</li>
            </ul>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              disabled={loading}
              className="w-1/2 py-3 border border-red-300 text-red-700 rounded-xl font-medium hover:bg-red-50 transition"
              onClick={() => handleRecordConsent(false)}
            >
              Decline
            </button>
            <button
              type="button"
              disabled={loading}
              className="w-1/2 bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-semibold shadow transition disabled:opacity-50"
              onClick={() => handleRecordConsent(true)}
            >
              {loading ? 'Recording Consent…' : 'I Accept & Consent ✓'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: ACTIVE SESSION */}
      {step === 'active' && (
        <div className="w-full bg-white rounded-2xl shadow-lg p-6 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500" /> Session Active & Consented
          </div>

          <h2 className="text-2xl font-bold text-slate-800">Check-In Session Ready</h2>

          <div className="bg-slate-50 p-4 rounded-xl text-left text-sm space-y-2 border border-slate-200">
            <p><strong className="text-slate-700">Encounter ID:</strong> <span className="font-mono text-blue-700 text-xs">{session?.encounter_id}</span></p>
            <p><strong className="text-slate-700">Patient ID:</strong> <span className="font-mono text-slate-600 text-xs">{session?.patient_id}</span></p>
            <p><strong className="text-slate-700">Patient:</strong> {formData.fullName || 'Anonymous Check-in'} ({formData.gender}, {formData.age || '—'} yrs)</p>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-xl">
            Adaptive Clinical Questionnaire begins here in Phase 4.
          </div>

          <button
            onClick={handleReset}
            className="w-full py-3 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-100 transition"
          >
            End Session & Reset Kiosk
          </button>
        </div>
      )}
    </div>
  )
}
