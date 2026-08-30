import React from 'react'
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
  otp,
  setOtp,
  otpChallengeId,
  onRequestPhoneOtp,
  onVerifyManualWithOtp,
}) {
  return (
    <div className="max-w-xl mx-auto w-full bg-white rounded-[32px] p-8 sm:p-10 border border-[#E4EDE9] shadow-xl space-y-6">
      
      <div className="flex items-center justify-between border-b border-[#E4EDE9] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5F7D74]">
            STEP 02 OF 04
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

      {/* Mode Tabs — Exactly 2 options */}
      <div className="grid grid-cols-2 p-1 bg-[#FAF7F2] rounded-2xl border border-[#E4EDE9] text-xs font-bold">
        <button
          type="button"
          onClick={() => setLoginMode('abha')}
          className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            loginMode === 'abha'
              ? 'bg-white text-[#12322B] shadow-sm border border-[#E4EDE9]'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          {t('abha_login_tab', lang)}
          <span className="text-[9px] bg-[#BFD8D2] text-[#12322B] px-1.5 py-0.5 rounded font-mono">Instant</span>
        </button>

        <button
          type="button"
          onClick={() => setLoginMode('manual')}
          className={`py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 ${
            loginMode === 'manual'
              ? 'bg-white text-[#12322B] shadow-sm border border-[#E4EDE9]'
              : 'text-[#5F7D74] hover:text-[#12322B]'
          }`}
        >
          {t('manual_checkin_tab', lang)}
          <span className="text-[9px] bg-[#E4EDE9] text-[#12322B] px-1.5 py-0.5 rounded font-mono">Phone OTP</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-[#FDF0ED] border border-[#FADCD5] text-[#8F2A24] text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      {/* ABHA Form */}
      {loginMode === 'abha' && (
        <form onSubmit={onAbhaLogin} className="space-y-4">
          <div className="p-5 bg-[#12322B] rounded-2xl text-white space-y-4 border border-[#1C453C]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#BFD8D2] uppercase tracking-widest text-[10px]">National Health Authority</span>
              <span className="bg-[#BFD8D2]/20 text-[#BFD8D2] px-2 py-0.5 rounded text-[10px] font-mono">ABDM Ready</span>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#BFD8D2] mb-1.5">14-Digit ABHA Number</label>
              <input
                type="text"
                placeholder="91-4820-9182-3491"
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
                placeholder="1234"
                className="w-full p-3.5 bg-black/20 border border-white/20 rounded-xl outline-none focus:border-[#BFD8D2] font-mono text-sm text-white placeholder-white/40"
                value={abhaPin}
                onChange={(e) => setAbhaPin(e.target.value)}
              />
              <span className="text-[10px] text-[#BFD8D2]/80 mt-1 block">💡 Demo Mode: PIN 1234 pre-filled for instant verification.</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
          >
            {loading ? t('authenticating', lang) : t('verify_start', lang)}
          </button>
        </form>
      )}

      {/* Manual Check-in Form with Compulsory Phone OTP */}
      {loginMode === 'manual' && (
        <form onSubmit={otpChallengeId ? onVerifyManualWithOtp : onRequestPhoneOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('full_name', lang)}</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-medium text-sm text-[#12322B]"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              disabled={Boolean(otpChallengeId)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('age', lang)}</label>
              <input
                type="number"
                required
                min={1}
                max={120}
                placeholder="34"
                className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-medium text-sm text-[#12322B]"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                disabled={Boolean(otpChallengeId)}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('gender', lang)}</label>
              <select
                className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-medium text-sm text-[#12322B]"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                disabled={Boolean(otpChallengeId)}
              >
                <option value="Male">{t('male', lang)}</option>
                <option value="Female">{t('female', lang)}</option>
                <option value="Other">{t('other', lang)}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#12322B] mb-1.5">{t('phone_optional', lang)}</label>
            <input
              type="tel"
              required
              placeholder="+91 98765 43210"
              className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-[#FAF7F2] font-medium text-sm text-[#12322B]"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={Boolean(otpChallengeId)}
            />
          </div>

          {otpChallengeId && (
            <div className="p-4 bg-[#FAF7F2] border border-[#E4EDE9] rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#12322B] mb-1.5">Verification Code (OTP)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  maxLength={6}
                  pattern="[0-9]{6}"
                  placeholder="Enter 6-digit code"
                  className="w-full p-3.5 border border-[#E4EDE9] rounded-xl outline-none focus:border-[#12322B] bg-white font-mono text-sm text-[#12322B]"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </div>
              <button
                type="button"
                onClick={onRequestPhoneOtp}
                disabled={loading}
                className="text-xs font-semibold text-[#5F7D74] hover:text-[#12322B] transition"
              >
                Resend verification code
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full bg-[#12322B] hover:bg-[#1C453C] text-white font-bold text-xs uppercase tracking-wider shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Please wait…' : otpChallengeId ? 'Verify & Start Session →' : 'Send Verification OTP →'}
          </button>

          {/* Firebase invisible reCAPTCHA anchor */}
          <div id="recaptcha-container"></div>
        </form>
      )}

    </div>
  )
}
