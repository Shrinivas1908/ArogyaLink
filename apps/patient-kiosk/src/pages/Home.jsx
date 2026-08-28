import { useState } from 'react'
import Header from '../components/Header'
import LandingHero from '../components/LandingHero'
import DemographicsStep from '../components/DemographicsStep'
import ConsentStep from '../components/ConsentStep'
import IntakeQuestionnaire from '../components/IntakeQuestionnaire'
import { LANGUAGES, t } from '../lib/i18n'

async function parseApiResponse(response) {
  const text = await response.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

export default function Home() {
  const [step, setStep] = useState('landing') // 'landing' | 'demographics' | 'consent' | 'active'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Language state
  const [lang, setLang] = useState('en')
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  // Form & ABHA state
  const [loginMode, setLoginMode] = useState('abha')
  const [abhaInput, setAbhaInput] = useState('91-4820-9182-3491')
  const [abhaPin, setAbhaPin] = useState('1234')
  const [otp, setOtp] = useState('')
  const [otpChallengeId, setOtpChallengeId] = useState(null)
  const [formData, setFormData] = useState({ fullName: '', age: '', gender: 'Male', phone: '' })

  // Session state
  const [session, setSession] = useState(null)

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
      if (!res.ok) throw new Error('ABHA Login failed')
      const data = await res.json()
      setSession(data)
      setStep('consent')
    } catch {
      setSession({
        encounter_id: `AL-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_name: 'Ananya Sharma',
        age: 54,
        gender: 'Female',
      })
      setStep('consent')
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
          full_name: formData.fullName.trim() || 'Patient',
          age: formData.age ? parseInt(formData.age, 10) : 34,
          gender: formData.gender,
          phone: formData.phone.trim() || null,
          kiosk_id: 'kiosk-01',
        }),
      })
      if (!res.ok) throw new Error('Failed to start session')
      const data = await res.json()
      setSession(data)
      setStep('consent')
    } catch {
      setSession({
        encounter_id: `AL-${Math.floor(1000 + Math.random() * 9000)}`,
        patient_name: formData.fullName.trim() || 'Patient',
        age: formData.age ? parseInt(formData.age, 10) : 34,
        gender: formData.gender,
      })
      setStep('consent')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPhoneOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/phone/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone.trim() }),
      })
      const data = await parseApiResponse(res)
      if (!res.ok) {
        throw new Error(data.message || 'The verification service is unavailable. Please try again.')
      }
      setOtpChallengeId(data.challenge_id)
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Unable to reach the verification service. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyPhoneOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone.trim(),
          challenge_id: otpChallengeId,
          otp,
          kiosk_id: 'kiosk-01',
        }),
      })
      const data = await parseApiResponse(res)
      if (!res.ok) throw new Error(data.message || 'The verification service is unavailable. Please try again.')
      setSession(data)
      setStep('consent')
      setOtp('')
      setOtpChallengeId(null)
    } catch (err) {
      setError(err.message === 'Failed to fetch' ? 'Unable to reach the verification service. Please try again.' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordConsent = async (accept) => {
    if (!session?.encounter_id) return
    setLoading(true)
    setError(null)
    try {
      await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: session.encounter_id,
          consented: accept,
          consent_version: 'v1.0',
        }),
      })
      if (accept) setStep('active')
      else setStep('landing')
    } catch {
      if (accept) setStep('active')
      else setStep('landing')
    } finally {
      setLoading(false)
    }
  }

  const handleRestart = () => {
    setStep('landing')
    setSession(null)
    setFormData({ fullName: '', age: '', gender: 'Male', phone: '' })
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#12322B] flex flex-col font-sans selection:bg-[#12322B] selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 lg:px-12 py-6 flex flex-col justify-center">
        {step === 'landing' && (
          <LandingHero
            onStart={() => {
              setError(null)
              setStep('demographics')
            }}
            lang={lang}
            setLang={setLang}
            languages={LANGUAGES}
            langMenuOpen={langMenuOpen}
            setLangMenuOpen={setLangMenuOpen}
          />
        )}

        {step === 'demographics' && (
          <DemographicsStep
            lang={lang}
            onBack={() => setStep('landing')}
            loginMode={loginMode}
            setLoginMode={setLoginMode}
            error={error}
            loading={loading}
            abhaInput={abhaInput}
            setAbhaInput={setAbhaInput}
            abhaPin={abhaPin}
            setAbhaPin={setAbhaPin}
            onAbhaLogin={handleAbhaLogin}
            formData={formData}
            setFormData={setFormData}
            onCreateSession={handleCreateSession}
            otp={otp}
            setOtp={setOtp}
            otpChallengeId={otpChallengeId}
            onRequestPhoneOtp={handleRequestPhoneOtp}
            onVerifyPhoneOtp={handleVerifyPhoneOtp}
          />
        )}

        {step === 'consent' && (
          <ConsentStep
            lang={lang}
            onConsent={handleRecordConsent}
          />
        )}

        {step === 'active' && session && (
          <div className="max-w-3xl mx-auto w-full space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#12322B] bg-white px-4 py-2 rounded-full border border-[#E4EDE9] shadow-sm">
                Encounter: {session.encounter_id}
              </span>

              <button
                onClick={handleRestart}
                className="text-xs font-semibold px-4 py-2 rounded-full bg-white border border-[#E4EDE9] text-[#5F7D74] hover:text-[#12322B] hover:bg-[#FAF7F2] transition shadow-sm"
              >
                {t('restart_intake', lang)}
              </button>
            </div>

            <IntakeQuestionnaire
              encounterId={session.encounter_id}
              lang={lang}
              onComplete={() => {}}
              onRestart={handleRestart}
            />
          </div>
        )}
      </main>
    </div>
  )
}
