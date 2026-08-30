import React, { useState } from 'react'
import { t } from '../lib/i18n'

export default function DemographicsStep({
  lang,
  onBack,
  loginMode,
  setLoginMode,
  error,
  loading,
  abhaInput,
  setAbhaInput,
  abhaPin,
  setAbhaPin,
  onAbhaLogin,
  formData,
  setFormData,
  onCreateSession,
}) {
  const [isListeningName, setIsListeningName] = useState(false)

  const handleSpeakName = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.')
      return
    }

    if (isListeningName) {
      setIsListeningName(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'hi' ? 'hi-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN'
    recognition.interimResults = false

    recognition.onstart = () => setIsListeningName(true)
    recognition.onresult = (event) => {
      const spokenName = event.results[0][0].transcript
      setFormData((prev) => ({ ...prev, fullName: spokenName }))
      setIsListeningName(false)
    }
    recognition.onerror = () => setIsListeningName(false)
    recognition.onend = () => setIsListeningName(false)

    try {
      recognition.start()
    } catch {
      setIsListeningName(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-[32px] p-8 sm:p-10 border border-[#E4EDE9] shadow-xl space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F7D74]">
            STEP 02 OF 04 · PATIENT IDENTIFICATION
          </span>
          <h2 className="text-2xl font-serif text-[#12322B] mt-0.5">
            {t('patient_checkin', lang)}
          </h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs text-[#5F7D74] hover:text-[#12322B] font-medium"
        >
          ← Back
        </button>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] text-xs font-bold">
        <button
          type="button"
          onClick={() => setLoginMode('manual')}
          className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            loginMode === 'manual'
              ? 'bg-white text-[#12322B] shadow-sm border border-[#E4EDE9]'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          <span>👤 Direct Registration</span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">Standard</span>
        </button>

        <button
          type="button"
          onClick={() => setLoginMode('abha')}
          className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            loginMode === 'abha'
              ? 'bg-white text-[#12322B] shadow-sm border border-[#E4EDE9]'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          <span>🇮🇳 ABHA Number</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 bg-[#FDF0ED] border border-[#FADCD5] text-[#8F2A24] text-xs rounded-2xl font-semibold animate-fadeIn">
          ⚠️ {error}
        </div>
      )}

      {/* ── MODE 1: Direct Registration (Patient Name Demanded) ────────── */}
      {loginMode === 'manual' && (
        <form onSubmit={onCreateSession} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#12322B] flex items-center gap-1">
                <span>{t('full_name', lang)}</span>
                <span className="text-red-600 font-bold">* (Required)</span>
              </label>
              <button
                type="button"
                onClick={handleSpeakName}
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition flex items-center gap-1 ${
                  isListeningName
                    ? 'bg-red-600 text-white animate-pulse'
                    : 'bg-[#E4EDE9] text-[#12322B] hover:bg-[#BFD8D2]'
                }`}
              >
                <span>🎙️</span>
                <span>{isListeningName ? 'Listening...' : 'Speak Name (बोलें)'}</span>
              </button>
            </div>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh Patil / अनीता शर्मा"
              className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-semibold text-sm text-[#12322B] placeholder:text-slate-400"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-1.5">
                <span>{t('age', lang)}</span>
                <span className="text-red-600 font-bold"> *</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={125}
                placeholder="48"
                className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-semibold text-sm text-[#12322B]"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('gender', lang)}</label>
              <select
                className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-semibold text-sm text-[#12322B]"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">{t('male', lang)} (पुरुष)</option>
                <option value="Female">{t('female', lang)} (महिला)</option>
                <option value="Other">{t('other', lang)}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('phone_optional', lang)}</label>
            <input
              type="tel"
              placeholder="+91 96238 03405"
              className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-semibold text-sm text-[#12322B]"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 active:scale-95"
          >
            {loading ? t('starting_session', lang) : '✓ Register & Start Clinical Intake'}
          </button>
        </form>
      )}

      {/* ── MODE 2: ABHA Form ─────────────────────────────────────────── */}
      {loginMode === 'abha' && (
        <form onSubmit={onAbhaLogin} className="space-y-4">
          <div className="p-5 bg-[#12322B] rounded-2xl text-white space-y-4 border border-[#1C453C]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#BFD8D2] uppercase tracking-widest text-[10px]">National Health Authority</span>
              <span className="bg-[#BFD8D2]/20 text-[#BFD8D2] px-2 py-0.5 rounded text-[10px] font-mono">ABDM Ready</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#BFD8D2] mb-1.5">14-Digit ABHA Number / Address</label>
              <input
                type="text"
                placeholder="e.g. 91-4820-9182-3491 or name@abdm"
                className="w-full p-3.5 bg-black/20 border border-white/20 rounded-xl outline-none focus:border-[#BFD8D2] font-mono text-sm text-white placeholder-white/40"
                value={abhaInput}
                onChange={(e) => setAbhaInput(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#BFD8D2] mb-1.5">Security PIN / OTP</label>
              <input
                type="password"
                maxLength={6}
                placeholder="Enter 4 or 6-digit PIN"
                className="w-full p-3.5 bg-black/20 border border-white/20 rounded-xl outline-none focus:border-[#BFD8D2] font-mono text-sm text-white placeholder-white/40"
                value={abhaPin}
                onChange={(e) => setAbhaPin(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 active:scale-95"
          >
            {loading ? t('authenticating', lang) : t('verify_start', lang)}
          </button>
        </form>
      )}

    </div>
  )
}
