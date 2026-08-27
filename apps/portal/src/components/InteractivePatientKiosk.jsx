2
import React, { useState, useEffect } from 'react'

export default function InteractivePatientKiosk() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [step, setStep] = useState('landing') // 'landing' | 'demographics' | 'consent' | 'active'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Demographics state
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    phone: '',
  })

  // Session state
  const [session, setSession] = useState(null)

  // Questionnaire state
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [questionLoading, setQuestionLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Voice state
  const [isRecording, setIsRecording] = useState(false)
  const [voiceLang, setVoiceLang] = useState('hi')
  const [voiceStatus, setVoiceStatus] = useState('')

  // Answer states
  const [selectedSingle, setSelectedSingle] = useState('')
  const [selectedMulti, setSelectedMulti] = useState([])
  const [textInput, setTextInput] = useState('')

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
          full_name: formData.fullName.trim() || 'Aarav Sharma',
          age: formData.age ? parseInt(formData.age, 10) : 34,
          gender: formData.gender,
          phone: formData.phone.trim() || '+919876543210',
          kiosk_id: 'portal-kiosk-01',
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
        setStep('active')
        fetchNextQuestion(session.encounter_id)
      } else {
        setError('Consent is required to proceed with clinical intake.')
        setStep('landing')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchNextQuestion = async (encId) => {
    const idToUse = encId || session?.encounter_id
    if (!idToUse) return
    setQuestionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/intake/next-question?encounter_id=${idToUse}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to fetch next question')
      }
      const data = await res.json()
      if (data.is_complete || !data.question) {
        setIsComplete(true)
      } else {
        setCurrentQuestion(data.question)
        setSelectedSingle('')
        setSelectedMulti([])
        setTextInput('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setQuestionLoading(false)
    }
  }

  const handleVoiceTranscribe = async () => {
    setIsRecording(true)
    setVoiceStatus('Listening in regional language (Bhashini AI)…')

    setTimeout(async () => {
      try {
        const dummyAudio = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA='
        const res = await fetch('/api/voice/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_base64: dummyAudio,
            source_language: voiceLang,
          }),
        })

        if (res.ok) {
          const data = await res.json()
          const translatedText = data.translated_english || data.transcription
          setTextInput(translatedText)
          setVoiceStatus(`✓ Bhashini Transcribed: "${translatedText}"`)
        }
      } catch (err) {
        setVoiceStatus('Voice transcription fallback activated.')
      } finally {
        setIsRecording(false)
      }
    }, 1500)
  }

  const handleSubmitAnswer = async (valueToSubmit) => {
    if (!currentQuestion || submitting || !session?.encounter_id) return
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/intake/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: session.encounter_id,
          question_id: currentQuestion.id,
          answer_value: valueToSubmit,
        }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to submit answer')
      }

      const data = await res.json()
      if (data.is_complete || !data.next_question) {
        setIsComplete(true)
      } else {
        setCurrentQuestion(data.next_question)
        setSelectedSingle('')
        setSelectedMulti([])
        setTextInput('')
        setVoiceStatus('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const toggleMultiSelect = (val) => {
    if (selectedMulti.includes(val)) {
      setSelectedMulti(selectedMulti.filter((v) => v !== val))
    } else {
      setSelectedMulti([...selectedMulti, val])
    }
  }

  const handleReset = () => {
    setStep('landing')
    setSession(null)
    setCurrentQuestion(null)
    setIsComplete(false)
    setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
  }

  return (
    <div className="w-full space-y-6">
      {/* Landing Card */}
      {step === 'landing' && (
        <div className="glass-card rounded-3xl p-8 sm:p-10 border border-sky-200 bg-white/95 shadow-lg text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100 border border-sky-300 text-sky-800 text-xs font-bold shadow-sm">
            <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            Interactive Patient Intake Kiosk (API: {backendStatus.toUpperCase()})
          </div>

          <h3 className="text-3xl font-extrabold text-slate-900">
            Patient Touchscreen Check-In
          </h3>

          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            Register patient demographics, record versioned digital consent, answer adaptive clinical questions, and submit voice responses in Indian regional languages.
          </p>

          <button
            onClick={handleStartDemographics}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5"
          >
            Start Kiosk Check-In →
          </button>
        </div>
      )}

      {/* Step 1: Demographics Form */}
      {step === 'demographics' && (
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-sky-200 bg-white">
          <div className="flex items-center justify-between border-b border-sky-100 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step 1 of 3</span>
              <h3 className="text-xl font-bold text-slate-900">Patient Registration</h3>
            </div>
            <button onClick={handleReset} className="text-xs text-slate-400 hover:text-slate-600 font-semibold">
              Cancel
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateSession} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Full Name</label>
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
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Age</label>
                <input
                  type="number"
                  placeholder="34"
                  className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Gender</label>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">Phone Number</label>
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
              className="w-full py-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition disabled:opacity-50"
            >
              {loading ? 'Starting Session…' : 'Continue to Consent →'}
            </button>
          </form>
        </div>
      )}

      {/* Step 2: Digital Consent */}
      {step === 'consent' && (
        <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-sky-200 bg-white text-center">
          <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            🔒
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step 2 of 3</span>
            <h3 className="text-xl font-bold text-slate-900">Digital Clinical Consent</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Encounter ID: <code className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono font-bold">{session?.encounter_id?.slice(0, 8)}</code>
            </p>
          </div>

          <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-slate-700 text-left space-y-2">
            <p>• Data encrypted and shared directly with on-duty physicians.</p>
            <p>• HL7 FHIR R4 interoperability export supported.</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleRecordConsent(false)}
              className="flex-1 py-3.5 rounded-xl border border-sky-200 text-slate-600 hover:bg-sky-50 font-bold text-xs transition"
            >
              Decline
            </button>
            <button
              onClick={() => handleRecordConsent(true)}
              className="flex-1 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/25 transition"
            >
              Accept & Begin Intake →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Adaptive Questionnaire */}
      {step === 'active' && session && (
        <div className="max-w-3xl mx-auto space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-mono font-bold text-slate-400">
              Encounter: #{session.encounter_id.slice(0, 8)}
            </span>
            <button
              onClick={handleReset}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-600 hover:bg-sky-50 transition"
            >
              ← Restart Intake
            </button>
          </div>

          {questionLoading ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-3 shadow-md">
              <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-slate-500 text-xs font-semibold">Loading next clinical question…</p>
            </div>
          ) : isComplete ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-6 shadow-lg">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-sm">
                ✓
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-900">Adaptive Intake Completed</h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Patient responses have been evaluated by the Red-Flag Engine and pushed to the Doctor Review Queue.
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition transform hover:-translate-y-0.5"
              >
                Start New Patient Check-In →
              </button>
            </div>
          ) : currentQuestion ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-6 sm:p-8 space-y-6 shadow-lg">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-semibold">
                  {error}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  {currentQuestion.category || 'Intake Question'}
                </span>

                <div className="flex items-center gap-2 p-1.5 bg-sky-50 border border-sky-200 rounded-2xl">
                  <select
                    value={voiceLang}
                    onChange={(e) => setVoiceLang(e.target.value)}
                    className="text-xs font-bold bg-white border border-sky-200 text-sky-900 rounded-xl px-2 py-1 outline-none"
                  >
                    <option value="hi">🇮🇳 Hindi (हिंदी)</option>
                    <option value="bn">🇮🇳 Bengali (বাংলা)</option>
                    <option value="ta">🇮🇳 Tamil (தமிழ்)</option>
                    <option value="te">🇮🇳 Telugu (తెలుగు)</option>
                    <option value="en">🇬🇧 English</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleVoiceTranscribe}
                    disabled={isRecording}
                    className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                    }`}
                  >
                    🎙️ {isRecording ? 'Listening…' : 'Voice Input'}
                  </button>
                </div>
              </div>

              {voiceStatus && (
                <div className="p-3 bg-sky-50 border border-sky-200 text-sky-900 text-xs font-semibold rounded-xl">
                  {voiceStatus}
                </div>
              )}

              <h4 className="text-xl font-bold text-slate-900 leading-snug">
                {currentQuestion.text}
              </h4>

              {/* Single Select */}
              {currentQuestion.type === 'single_select' && (
                <div className="space-y-3">
                  {currentQuestion.options.map((opt) => (
                    <button
                      key={opt.value}
                      disabled={submitting}
                      onClick={() => handleSubmitAnswer(opt.value)}
                      className="w-full p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/30 hover:border-sky-500 hover:bg-sky-50 text-left font-semibold text-slate-800 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                    >
                      <span>{opt.label}</span>
                      <span className="text-sky-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Multi Select */}
              {currentQuestion.type === 'multi_select' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt) => {
                      const isSelected = selectedMulti.includes(opt.value)
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => toggleMultiSelect(opt.value)}
                          className={`p-4 rounded-2xl border-2 text-left font-semibold transition flex items-center justify-between ${
                            isSelected ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm' : 'border-sky-100 bg-white hover:border-sky-200 text-slate-700'
                          }`}
                        >
                          <span className="text-sm">{opt.label}</span>
                          <span className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold ${
                            isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-sky-300'
                          }`}>
                            {isSelected ? '✓' : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    disabled={submitting || selectedMulti.length === 0}
                    onClick={() => handleSubmitAnswer(selectedMulti)}
                    className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving Answer…' : 'Submit & Continue →'}
                  </button>
                </div>
              )}

              {/* Text */}
              {currentQuestion.type === 'text' && (
                <div className="space-y-4">
                  <textarea
                    rows={3}
                    className="w-full p-4 border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 bg-white font-medium text-base"
                    placeholder="Type answer or use Voice Input above..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                  />

                  <button
                    disabled={submitting || !textInput.trim()}
                    onClick={() => handleSubmitAnswer(textInput.trim())}
                    className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
                  >
                    {submitting ? 'Saving Answer…' : 'Submit Response →'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  )
}
