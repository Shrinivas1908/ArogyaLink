import React, { useState, useEffect } from 'react'
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

  // n8n OTP State
  const [otpSent, setOtpSent] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [demoOtp, setDemoOtp] = useState('')
  const [otpNotice, setOtpNotice] = useState(null)
  const [timerSeconds, setTimerSeconds] = useState(0)

  // Countdown timer effect
  useEffect(() => {
    let timer = null
    if (timerSeconds > 0) {
      timer = setInterval(() => {
        setTimerSeconds((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [timerSeconds])

  // Dispatch OTP via n8n workflow
  const handleSendOtp = async () => {
    const rawPhone = formData.phone ? formData.phone.replace(/\D/g, '') : ''
    if (rawPhone.length < 10) {
      alert('Please enter a valid 10-digit mobile number before requesting an OTP.')
      return
    }

    setOtpSending(true)
    setOtpNotice(null)
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: rawPhone }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setOtpSent(true)
        setTimerSeconds(45)
        if (data.demo_otp) {
          setDemoOtp(data.demo_otp)
        }
        setOtpNotice('✅ OTP dispatched via n8n Cloud. Please enter the 6-digit code sent to your phone.')
      } else {
        alert(data.message || data.detail || 'Could not send OTP. Please try again.')
      }
    } catch (err) {
      console.error('Failed to dispatch OTP via n8n:', err)
      alert('Network error while connecting to n8n OTP service.')
    } finally {
      setOtpSending(false)
    }
  }

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

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (!otpSent) {
      handleSendOtp()
      return
    }
    if (!otpValue.trim() || otpValue.trim().length < 4) {
      alert('Please enter the 6-digit OTP code to verify your registration.')
      return
    }
    onCreateSession(e, otpValue.trim())
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
          <span>📱 Mobile OTP Registration</span>
          <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">n8n Verified</span>
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

      {/* ── MODE 1: Mobile OTP Registration (Mandatory Mobile & OTP) ────────── */}
      {loginMode === 'manual' && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#12322B] flex items-center gap-1">
                <span>{t('full_name', lang)}</span>
                <span className="text-red-600 font-bold">*</span>
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

          {/* Mandatory Mobile Number without Optional Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#12322B] flex items-center gap-1">
                <span>Mobile Number (मोबाइल नंबर)</span>
                <span className="text-red-600 font-bold">*</span>
              </label>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                ⚡ n8n Verified
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="tel"
                required
                maxLength={10}
                placeholder="10-digit mobile (e.g. 9876543210)"
                className="flex-1 p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-semibold text-sm text-[#12322B] placeholder:text-slate-400 font-mono tracking-wide"
                value={formData.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, phone: val })
                }}
              />
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpSending || timerSeconds > 0 || (formData.phone || '').length < 10}
                className="px-4 py-3 bg-[#12322B] hover:bg-[#1C453C] disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap"
              >
                {otpSending ? 'Sending…' : timerSeconds > 0 ? `Resend (${timerSeconds}s)` : otpSent ? 'Resend OTP' : '📲 Send OTP'}
              </button>
            </div>

            {/* Required add-on security note line below the mobile input */}
            <p className="mt-2 text-[11px] text-[#5F7D74] flex items-center gap-1.5 font-medium leading-relaxed">
              <span>🔒</span>
              <span>A secure 6-digit OTP will be dispatched via n8n Cloud to verify your registration.</span>
            </p>
          </div>

          {/* OTP Input Card (Appears after clicking Send OTP) */}
          {otpSent && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Enter 6-Digit OTP Code</span>
                  <span className="text-red-600 font-bold">*</span>
                </span>
                {demoOtp && (
                  <span
                    onClick={() => setOtpValue(demoOtp)}
                    className="cursor-pointer text-[10px] font-mono bg-emerald-200/80 hover:bg-emerald-300 text-emerald-900 px-2 py-0.5 rounded font-bold transition"
                    title="Click to auto-fill for testing"
                  >
                    Auto-fill: {demoOtp}
                  </span>
                )}
              </div>

              <input
                type="text"
                required
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                className="w-full p-3.5 border-2 border-emerald-400 focus:border-emerald-600 rounded-xl outline-none bg-white font-mono text-center text-xl font-bold tracking-[0.3em] text-[#12322B] shadow-inner"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
              />

              {otpNotice && (
                <p className="text-[11px] text-emerald-800 font-medium text-center">
                  {otpNotice}
                </p>
              )}
            </div>
          )}

          {/* Action Submission Button */}
          <button
            type="submit"
            disabled={loading || (otpSent && otpValue.length < 4)}
            className="w-full py-4 rounded-full bg-gradient-to-r from-[#12322B] to-[#1C453C] hover:from-[#1C453C] hover:to-[#2A5E53] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
          >
            <span>
              {loading
                ? t('starting_session', lang)
                : otpSent
                ? '✓ Verify OTP & Proceed to Next Page'
                : '📲 Send OTP & Continue'}
            </span>
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
