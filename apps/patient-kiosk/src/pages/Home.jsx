import { useState } from 'react'
import Header from '../components/Header'
import LandingHero from '../components/LandingHero'
import DemographicsStep from '../components/DemographicsStep'
import ConsentStep from '../components/ConsentStep'
import IntakeQuestionnaire from '../components/IntakeQuestionnaire'
import { LANGUAGES, t } from '../lib/i18n'

export default function Home() {
  const [step, setStep] = useState('landing') // 'landing' | 'demographics' | 'consent' | 'active'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Language state
  const [lang, setLang] = useState('en')
  const [langMenuOpen, setLangMenuOpen] = useState(false)

  // Form & ABHA state
  const [loginMode, setLoginMode] = useState('manual') // Default to direct Patient Name registration
  const [abhaInput, setAbhaInput] = useState('')
  const [abhaPin, setAbhaPin] = useState('')
  const [formData, setFormData] = useState({ fullName: '', age: '', gender: 'Male', phone: '' })

  // Session state
  const [session, setSession] = useState(null)

  const handleAbhaLogin = async (e) => {
    e.preventDefault()
    if (!abhaInput.trim()) {
      setError('Please enter your 14-digit ABHA ID or switch to Direct Registration.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/session/abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abha_id: abhaInput.trim(),
          pin: abhaPin.trim() || '1234',
          kiosk_id: 'kiosk-01',
        }),
      })
      if (!res.ok) throw new Error('ABHA verification failed. Please check ID.')
      const data = await res.json()
      setSession(data)
      setStep('consent')
    } catch (err) {
      setError(err.message || 'ABHA verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e, otpCode) => {
    if (e) e.preventDefault()
    const name = formData.fullName.trim()
    if (!name) {
      setError('Patient Full Name is required to start registration (मरीज़ का नाम अनिवार्य है).')
      return
    }
    const parsedAge = parseInt(formData.age, 10)
    if (!formData.age || isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 125) {
      setError('Please enter a valid patient age between 1 and 125.')
      return
    }
    const cleanPhone = formData.phone ? formData.phone.replace(/\D/g, '') : ''
    if (cleanPhone.length < 10) {
      setError('Please provide a valid 10-digit mobile phone number.')
      return
    }
    if (!otpCode || otpCode.trim().length < 4) {
      setError('Please enter the 6-digit OTP code sent via n8n to your phone.')
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name,
          age: parsedAge,
          gender: formData.gender || 'Male',
          phone: cleanPhone,
          otp: otpCode.trim(),
          kiosk_id: 'kiosk-01',
        }),
      })
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}))
        throw new Error(errJson.detail || 'Failed to start session on server')
      }
      const data = await res.json()
      setSession(data)
      setStep('consent')
    } catch (err) {
      setError(err.message || 'Failed to start intake session')
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
