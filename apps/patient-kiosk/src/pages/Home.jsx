import { useState, useEffect } from 'react'
import Header from '../components/Header'
import IntakeQuestionnaire from '../components/IntakeQuestionnaire'
import { t, LANGUAGES } from '../lib/i18n'

/**
 * Patient Kiosk — Home Page
 * ──────────────────────────
 * Steps:
 *   0. Language selection (NEW)
 *   1. Demographics / ABHA login
 *   2. Consent
 *   3. Active intake questionnaire (multilingual)
 */
export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking')
  const [step, setStep] = useState('language') // 'language' | 'landing' | 'demographics' | 'consent' | 'active'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ── Language state ─────────────────────────────────────────────────────
  const [lang, setLang] = useState('en')
  const [pendingLang, setPendingLang] = useState('en')

  // ── Form & ABHA state ──────────────────────────────────────────────────
  const [loginMode, setLoginMode] = useState('abha')
  const [abhaInput, setAbhaInput] = useState('91-4820-9182-3491')
  const [abhaPin, setAbhaPin] = useState('1234')
  const [formData, setFormData] = useState({ fullName: '', age: '', gender: 'Male', phone: '' })

  // ── Session state ──────────────────────────────────────────────────────
  const [session, setSession] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setBackendStatus(d.status === 'ok' ? 'connected' : 'degraded'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSelectLanguage = () => {
    setLang(pendingLang)
    setStep('landing')
  }

  const handleStartDemographics = () => {
    setError(null)
    setStep('demographics')
  }

  const handleAbhaLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/session/abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abha_id: abhaInput.trim() || '91-4820-9182-3491',
          pin: abhaPin.trim() || '1234',
          kiosk_id: 'kiosk-01',
        }),
      })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'ABHA Login failed')
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

  const handleRestart = () => {
    setStep('language')
    setSession(null)
    setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
    setLang('en')
    setPendingLang('en')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-sky-50/50 text-slate-800 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Step 0: Language Picker ─────────────────────────────────── */}
        {step === 'language' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold">
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {t('backend_status', 'en')}: {backendStatus.toUpperCase()}
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {t('choose_language', pendingLang)}
              </h1>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                {t('choose_language_sub', pendingLang)}
              </p>
            </div>

            {/* Language Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  id={`lang-${l.code}`}
                  type="button"
                  onClick={() => setPendingLang(l.code)}
                  className={`relative p-4 rounded-2xl border-2 text-center transition-all duration-200 transform hover:-translate-y-0.5 ${
                    pendingLang === l.code
                      ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-500/20 scale-105'
                      : 'border-sky-100 bg-white hover:border-sky-300 shadow-sm'
                  }`}
                >
                  {pendingLang === l.code && (
                    <span className="absolute top-2 right-2 w-4 h-4 bg-sky-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold">✓</span>
                  )}
                  <span className="text-3xl block mb-2">{l.flag}</span>
                  <span className={`block text-sm font-bold ${pendingLang === l.code ? 'text-sky-700' : 'text-slate-700'}`}>
                    {l.nativeName}
                  </span>
                  <span className="block text-[11px] text-slate-400 mt-0.5">{l.name}</span>
                </button>
              ))}
            </div>

            {/* Continue button */}
            <div className="pt-2">
              <button
                id="lang-continue-btn"
                onClick={handleSelectLanguage}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-lg shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5"
              >
                {t('continue_btn', pendingLang)}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 1: Landing Hero ────────────────────────────────────── */}
        {step === 'landing' && (
          <div className="space-y-8">
            <div className="relative glass-panel rounded-3xl p-8 sm:p-12 overflow-hidden shadow-sm border border-sky-100 text-center space-y-6">

              {/* Status Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-bold shadow-sm">
                <span className={`w-2 h-2 rounded-full ${backendStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                {t('backend_status', lang)}: {backendStatus.toUpperCase()}
              </div>

              {/* Language switcher pill */}
              <button
                onClick={() => setStep('language')}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 transition"
              >
                {LANGUAGES.find((l) => l.code === lang)?.flag} {LANGUAGES.find((l) => l.code === lang)?.nativeName}
                <span className="text-slate-400">✎</span>
              </button>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
                {t('kiosk_title', lang).includes('&') ? (
                  <>
                    {t('kiosk_title', lang).split(' ').slice(0, -1).join(' ')}{' '}
                    <span className="bg-gradient-to-r from-sky-600 to-sky-400 bg-clip-text text-transparent">
                      {t('kiosk_title', lang).split(' ').slice(-1)}
                    </span>
                  </>
                ) : (
                  <span>{t('kiosk_title', lang)}</span>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-medium">
                {t('kiosk_subtitle', lang)}
              </p>

              <div className="pt-4">
                <button
                  id="begin-checkin-btn"
                  onClick={handleStartDemographics}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-lg shadow-lg shadow-sky-500/25 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  {t('begin_checkin', lang)}
                </button>
              </div>

              {/* Feature Grid Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-sky-100 max-w-4xl mx-auto">
                <div className="p-4 rounded-2xl bg-white/80 border border-sky-100 shadow-sm text-center">
                  <span className="text-2xl mb-1 block">🎙️</span>
                  <span className="text-xs font-bold text-slate-900 block">7 Languages Voice</span>
                  <span className="text-[10px] text-slate-500">Web Speech API</span>
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

        {/* ── Step 2: Demographics Form ───────────────────────────────── */}
        {step === 'demographics' && (
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl border border-sky-200 bg-white">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">{t('step1_of3', lang)}</span>
              <h2 className="text-2xl font-bold text-slate-900">{t('patient_checkin', lang)}</h2>
              <p className="text-xs text-slate-500">{t('login_sub', lang)}</p>
            </div>

            {/* Login Mode Tabs */}
            <div className="grid grid-cols-2 p-1.5 bg-sky-50 rounded-2xl border border-sky-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLoginMode('abha')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  loginMode === 'abha'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('abha_login_tab', lang)}
                <span className="text-[10px] bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded font-mono">Instant</span>
              </button>

              <button
                type="button"
                onClick={() => setLoginMode('manual')}
                className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
                  loginMode === 'manual'
                    ? 'bg-white text-sky-700 shadow-sm border border-sky-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t('manual_checkin_tab', lang)}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
                {error}
              </div>
            )}

            {/* Mode A: ABHA Login */}
            {loginMode === 'abha' && (
              <form onSubmit={handleAbhaLogin} className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-sky-950 to-slate-900 rounded-2xl text-white space-y-3 border border-sky-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-300 uppercase tracking-widest text-[10px]">National Health Authority</span>
                    <span className="bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded text-[10px] font-mono border border-sky-500/30">ABDM M1 Ready</span>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-sky-200 mb-1">14-Digit ABHA Number / Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 91-4820-9182-3491 or aarav@abdm"
                      className="w-full p-3 bg-slate-800/90 border border-sky-500/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 font-mono text-sm text-white placeholder-slate-400"
                      value={abhaInput}
                      onChange={(e) => setAbhaInput(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-sky-200 mb-1">4-Digit Security PIN / Quick OTP</label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="1234"
                      className="w-full p-3 bg-slate-800/90 border border-sky-500/50 rounded-xl outline-none focus:ring-2 focus:ring-sky-400 font-mono text-sm text-white placeholder-slate-400"
                      value={abhaPin}
                      onChange={(e) => setAbhaPin(e.target.value)}
                    />
                    <span className="text-[10px] text-sky-300 mt-1 block">💡 Demo Mode: Use PIN 1234 or any 4-digit PIN for instant synthetic auth.</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-sm shadow-md shadow-sky-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? t('authenticating', lang) : t('verify_start', lang)}
                </button>
              </form>
            )}

            {/* Mode B: Manual Check-In */}
            {loginMode === 'manual' && (
              <form onSubmit={handleCreateSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('full_name', lang)}</label>
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('age', lang)}</label>
                    <input
                      type="number"
                      placeholder="34"
                      className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">{t('gender', lang)}</label>
                    <select
                      className="w-full p-3 border border-sky-200 rounded-xl outline-none focus:ring-2 focus:ring-sky-500 bg-white font-medium text-sm"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                      <option value="Male">{t('male', lang)}</option>
                      <option value="Female">{t('female', lang)}</option>
                      <option value="Other">{t('other', lang)}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{t('phone_optional', lang)}</label>
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
                  {loading ? t('starting_session', lang) : t('continue_to_consent', lang)}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Step 3: Consent ─────────────────────────────────────────── */}
        {step === 'consent' && (
          <div className="max-w-xl mx-auto glass-card rounded-3xl p-8 space-y-6 shadow-xl text-center">
            <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">{t('step2_of3', lang)}</span>
              <h2 className="text-2xl font-bold text-slate-900">{t('digital_consent', lang)}</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">{t('consent_desc', lang)}</p>
            </div>

            <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs text-slate-700 text-left space-y-2">
              <p>{t('consent_bullet1', lang)}</p>
              <p>{t('consent_bullet2', lang)}</p>
              <p>{t('consent_bullet3', lang)}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleRecordConsent(false)}
                className="flex-1 py-3.5 rounded-xl border border-sky-200 text-slate-600 hover:bg-sky-50 font-bold text-sm transition"
              >
                {t('decline', lang)}
              </button>
              <button
                id="consent-accept-btn"
                onClick={() => handleRecordConsent(true)}
                className="flex-1 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition"
              >
                {t('accept_begin', lang)}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Active Intake ───────────────────────────────────── */}
        {step === 'active' && session && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              {/* Active language badge */}
              <button
                onClick={() => {
                  /* Allow language change mid-session */
                  setStep('language')
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 transition"
              >
                {LANGUAGES.find((l) => l.code === lang)?.flag}{' '}
                {LANGUAGES.find((l) => l.code === lang)?.nativeName}
                <span className="text-slate-400">✎</span>
              </button>

              <button
                onClick={handleRestart}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-sky-200 text-slate-600 hover:bg-sky-50 transition"
              >
                {t('restart_intake', lang)}
              </button>
            </div>

            <IntakeQuestionnaire
              encounterId={session.encounter_id}
              lang={lang}
              onComplete={() => console.log('Intake completed')}
              onRestart={handleRestart}
            />
          </div>
        )}

      </main>
    </div>
  )
}
