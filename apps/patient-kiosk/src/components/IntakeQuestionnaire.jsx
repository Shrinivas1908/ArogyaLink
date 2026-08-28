import { useState, useEffect } from 'react'
import { t, tOpt, tQuestion } from '../lib/i18n'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { LANGUAGES } from '../lib/i18n'

/**
 * Adaptive Clinical Intake Questionnaire
 * ─────────────────────────────────────
 * Features:
 *  - Full multilingual UI (7 Indian languages) via i18n.js
 *  - Real browser voice input via Web Speech API (useVoiceRecorder)
 *  - Touchpad-friendly multi/single select + text input
 *  - White / Sky Blue design system
 *
 * Props:
 *   encounterId  {string}    Active encounter UUID
 *   lang         {string}    Language code: 'en'|'hi'|'bn'|'ta'|'te'|'mr'|'gu'
 *   onComplete   {function}  Called when all questions answered
 *   onRestart    {function}  Called when user restarts
 */
export default function IntakeQuestionnaire({ encounterId, lang = 'en', onComplete, onRestart }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [selectedSingle, setSelectedSingle] = useState('')
  const [selectedMulti, setSelectedMulti] = useState([])
  const [textInput, setTextInput] = useState('')
  const [voiceStatus, setVoiceStatus] = useState('')

  // Resolve BCP-47 speech code from the selected lang
  const langObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  // Real voice recorder (Web Speech API)
  const { isListening, transcript, error: voiceError, startListening, stopListening, isSupported } =
    useVoiceRecorder({
      lang: langObj.speechCode,
      onResult: (text) => {
        setTextInput(text)
        setVoiceStatus(`${t('voice_transcribed', lang)}: "${text}"`)
      },
      onError: (msg) => {
        setVoiceStatus(msg)
      },
    })

  // Update voice status live while listening
  useEffect(() => {
    if (isListening) {
      setVoiceStatus(t('listening', lang))
    }
  }, [isListening, lang])

  useEffect(() => {
    if (transcript && !isListening) {
      setVoiceStatus(`${t('voice_transcribed', lang)}: "${transcript}"`)
    }
  }, [transcript, isListening, lang])

  // ── Fetch next question ────────────────────────────────────────────────
  const fetchNextQuestion = async () => {
    if (!encounterId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intake/next-question?encounter_id=${encounterId}&lang=${lang}`)
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.message || 'Failed to fetch next question')
      }
      const data = await res.json()
      if (data.is_complete || !data.question) {
        setIsComplete(true)
        if (onComplete) onComplete()
      } else {
        setCurrentQuestion(data.question)
        setSelectedSingle('')
        setSelectedMulti([])
        setTextInput('')
        setVoiceStatus('')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNextQuestion()
  }, [encounterId])

  // ── Submit answer ──────────────────────────────────────────────────────
  const handleSubmitAnswer = async (valueToSubmit) => {
    if (!currentQuestion || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/intake/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encounterId,
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
        if (onComplete) onComplete()
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
    setSelectedMulti((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    )
  }

  // ── Voice button handler ───────────────────────────────────────────────
  const handleVoiceClick = () => {
    if (!isSupported) {
      setVoiceStatus(t('voice_not_supported', lang))
      return
    }
    if (isListening) {
      stopListening()
    } else {
      setTextInput('')
      startListening()
    }
  }

  // ── Translate option label ─────────────────────────────────────────────
  const translateOption = (opt) => tOpt(opt.value, lang, opt.label)

  // ── Translate question text ────────────────────────────────────────────
  const translateQuestion = (q) => tQuestion(q.id, lang, q.text)

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-3 shadow-md">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">{t('loading_question', lang)}</p>
      </div>
    )
  }

  // ── Summary & Verification state ───────────────────────────────────────
  const [summaryData, setSummaryData] = useState(null)
  const [triageData, setTriageData] = useState(null)
  const [answersList, setAnswersList] = useState([])
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [confirmedSubmitted, setConfirmedSubmitted] = useState(false)

  // When intake finishes, load full summary, triage evaluation & AI clinical synthesis
  useEffect(() => {
    if (isComplete && encounterId) {
      loadEncounterSummary()
    }
  }, [isComplete, encounterId])

  const loadEncounterSummary = async () => {
    setSummaryLoading(true)
    try {
      // 1. Evaluate triage and red flags
      const triageRes = await fetch('/api/triage/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: encounterId }),
      })
      if (triageRes.ok) {
        const tData = await triageRes.json()
        setTriageData(tData)
      }

      // 2. Fetch answers list
      const ansRes = await fetch(`/api/intake/answers/${encounterId}`)
      if (ansRes.ok) {
        const aData = await ansRes.json()
        setAnswersList(aData.answers || {})
      }

      // 3. Fetch Gemini AI clinical synthesis
      const sumRes = await fetch('/api/summary/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: encounterId }),
      })
      if (sumRes.ok) {
        const sData = await sumRes.json()
        setSummaryData(sData)
      }
    } catch (e) {
      console.error('Failed to load full summary:', e)
    } finally {
      setSummaryLoading(false)
    }
  }

  const handleConfirmSubmit = () => {
    setConfirmedSubmitted(true)
    if (onComplete) onComplete()
  }

  const handlePrintSlip = () => {
    window.print()
  }

  // ── Completion & Verification State ─────────────────────────────────────
  if (isComplete) {
    return (
      <div className="w-full bg-white rounded-3xl border border-sky-200 p-6 sm:p-8 space-y-6 shadow-xl text-left">
        
        {/* Step Indicator Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sky-100 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-sm">
              📋
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">Step 3 of 3 · Final Verification</span>
              <h2 className="text-2xl font-extrabold text-slate-900">Patient Intake Summary & Verification</h2>
            </div>
          </div>

          <div className="text-right bg-sky-50 px-4 py-2 rounded-2xl border border-sky-200">
            <span className="block text-[10px] font-bold uppercase text-slate-500">Encounter Reference</span>
            <span className="text-xs font-mono font-bold text-sky-900">{encounterId.slice(0, 13)}…</span>
          </div>
        </div>

        {summaryLoading ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-600 font-bold text-sm">Synthesizing clinical intake summary & triage level…</p>
          </div>
        ) : (
          <div className="space-y-6">

            {/* 1. Triage Priority Level Banner */}
            {triageData && (
              <div
                className={`p-4 rounded-2xl border-2 flex items-center justify-between ${
                  triageData.triage_level === 'CRITICAL'
                    ? 'bg-red-50 border-red-500 text-red-900 shadow-md animate-pulse'
                    : triageData.triage_level === 'URGENT'
                    ? 'bg-amber-50 border-amber-400 text-amber-900 shadow-sm'
                    : 'bg-emerald-50 border-emerald-400 text-emerald-900 shadow-sm'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {triageData.triage_level === 'CRITICAL' ? '🚨' : triageData.triage_level === 'URGENT' ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">Triage Classification:</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-white border border-current">
                        {triageData.triage_level}
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-0.5 opacity-90">
                      {triageData.triage_level === 'CRITICAL'
                        ? 'Immediate attention required. High-priority red-flag detected.'
                        : triageData.triage_level === 'URGENT'
                        ? 'Elevated symptoms recorded. Fast-track queue assigned.'
                        : 'Routine symptoms recorded. Assigned to standard doctor review queue.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Structured Clinical Synthesis (Gemini AI Summary) */}
            {summaryData?.summary && (
              <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1.5">
                    <span>✨</span> Clinical Synthesis & AI Summary
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-sky-700 border border-sky-200">
                    Auto-Extracted
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                    <span className="block font-bold text-slate-500 uppercase text-[10px]">Chief Complaint</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {summaryData.summary.chief_complaint || 'General Consultation'}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-sky-100 shadow-sm">
                    <span className="block font-bold text-slate-500 uppercase text-[10px]">Reported Severity</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {summaryData.summary.severity || 'Moderate'} (Duration: {summaryData.summary.duration || 'Reported'})
                    </span>
                  </div>
                </div>
                {summaryData.summary.clinical_summary && (
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-sky-100">
                    <strong className="text-slate-900">Summary: </strong> {summaryData.summary.clinical_summary}
                  </p>
                )}
              </div>
            )}

            {/* 3. Detailed Patient Answer Ledger */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Recorded Symptom Responses ({Object.keys(answersList).length} Recorded)
              </h4>
              <div className="max-h-56 overflow-y-auto border border-sky-100 rounded-2xl divide-y divide-sky-100 bg-white">
                {Object.entries(answersList).length > 0 ? (
                  Object.entries(answersList).map(([qKey, aVal], idx) => (
                    <div key={qKey} className="p-3 text-xs flex items-center justify-between gap-4 hover:bg-sky-50/50">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-700">
                          {qKey.replace(/q_/g, '').replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <span className="font-bold text-sky-900 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200">
                        {Array.isArray(aVal) ? aVal.join(', ') : typeof aVal === 'object' ? JSON.stringify(aVal) : String(aVal)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-slate-400 text-xs">No answers recorded</div>
                )}
              </div>
            </div>

            {/* 4. Patient Legal Verification & Liability Confirmation Checkbox */}
            <div className="bg-amber-50/70 border-2 border-amber-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="patient-liability-verify"
                  checked={isVerified}
                  onChange={(e) => setIsVerified(e.target.checked)}
                  className="mt-1 w-5 h-5 text-sky-600 rounded-lg border-sky-300 focus:ring-sky-500 cursor-pointer"
                />
                <label htmlFor="patient-liability-verify" className="text-xs text-slate-800 leading-relaxed cursor-pointer font-medium select-none">
                  <strong className="block text-slate-900 font-bold mb-0.5">
                    Patient / Caregiver Self-Verification & Information Accuracy Declaration:
                  </strong>
                  I hereby confirm that I have reviewed the recorded symptom summary, medical background, and intake responses above. I certify that this information is complete, truthful, and provided under my informed consent for medical evaluation and doctor diagnosis.
                </label>
              </div>
            </div>

            {/* 5. Confirmation State Banner */}
            {confirmedSubmitted && (
              <div className="p-5 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-emerald-950 space-y-2 text-center shadow-md">
                <span className="text-3xl block">🎉</span>
                <h3 className="text-lg font-extrabold text-emerald-900">Intake Record Verified & Queued to Doctor</h3>
                <p className="text-xs text-emerald-800 max-w-md mx-auto font-medium">
                  Your token has been transmitted to the Attending Physician's review dashboard. Please take a seat in the waiting lounge.
                </p>
                <div className="inline-block bg-white border border-emerald-300 px-4 py-1.5 rounded-full text-xs font-mono font-bold text-emerald-900 shadow-sm mt-2">
                  TOKEN #AL-{encounterId.slice(0, 6).toUpperCase()}
                </div>
              </div>
            )}

            {/* 6. Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              {!confirmedSubmitted ? (
                <button
                  id="verify-submit-btn"
                  disabled={!isVerified}
                  onClick={handleConfirmSubmit}
                  className="w-full sm:flex-1 py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <span>✓</span>
                  <span>Verify & Submit to Doctor Queue</span>
                </button>
              ) : (
                <button
                  onClick={handlePrintSlip}
                  className="w-full sm:flex-1 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <span>🖨️</span>
                  <span>Print / Save Intake Pass Slip</span>
                </button>
              )}

              {onRestart && (
                <button
                  onClick={onRestart}
                  className="w-full sm:w-auto px-6 py-4 rounded-2xl border-2 border-sky-200 text-slate-700 hover:bg-sky-50 font-bold text-sm transition"
                >
                  {t('new_patient_checkin', lang)}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="w-full bg-white rounded-3xl border border-sky-200 p-6 sm:p-8 space-y-6 shadow-lg">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-semibold">
          {error}
        </div>
      )}

      {/* Header: Category + Language label + Voice Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
          {currentQuestion.category?.replace(/_/g, ' ') || 'Intake Question'}
        </span>

        {/* Voice Bar */}
        <div className="flex items-center gap-2 p-1.5 bg-sky-50 border border-sky-200 rounded-2xl">
          {/* Current language badge */}
          <span className="text-xs font-bold px-2.5 py-1 bg-white border border-sky-200 text-sky-900 rounded-xl">
            {langObj.flag} {langObj.nativeName}
          </span>

          <button
            type="button"
            id="voice-input-btn"
            onClick={handleVoiceClick}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30'
                : isSupported
                ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {isListening ? t('listening', lang) : t('voice_input', lang)}
          </button>
        </div>
      </div>

      {/* Voice status / live transcript */}
      {(voiceStatus || voiceError) && (
        <div
          className={`p-3 text-xs font-semibold rounded-xl border ${
            voiceError
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}
        >
          {voiceError || voiceStatus}
        </div>
      )}

      {/* Live interim transcript while listening */}
      {isListening && transcript && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl animate-pulse">
          🎤 {transcript}
        </div>
      )}

      {/* Question text (translated) */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
        {translateQuestion(currentQuestion)}
      </h3>

      {/* ── Single Select ─────────────────────────────────────────────── */}
      {currentQuestion.type === 'single_select' && (
        <div className="space-y-3">
          {currentQuestion.options.map((opt) => (
            <button
              key={opt.value}
              disabled={submitting}
              onClick={() => handleSubmitAnswer(opt.value)}
              className="w-full p-4 rounded-2xl border-2 border-sky-100 bg-sky-50/30 hover:border-sky-500 hover:bg-sky-50 text-left font-semibold text-slate-800 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
            >
              <span>{translateOption(opt)}</span>
              <span className="text-sky-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Multi Select ──────────────────────────────────────────────── */}
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
                    isSelected
                      ? 'border-sky-500 bg-sky-50 text-sky-900 shadow-sm'
                      : 'border-sky-100 bg-white hover:border-sky-200 text-slate-700'
                  }`}
                >
                  <span className="text-sm">{translateOption(opt)}</span>
                  <span
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isSelected ? 'bg-sky-500 border-sky-500 text-white' : 'border-sky-300'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            id="multi-select-submit"
            disabled={submitting || selectedMulti.length === 0}
            onClick={() => handleSubmitAnswer(selectedMulti)}
            className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
          >
            {submitting ? t('saving_answer', lang) : t('submit_continue', lang)}
          </button>
        </div>
      )}

      {/* ── Text Input ────────────────────────────────────────────────── */}
      {currentQuestion.type === 'text' && (
        <div className="space-y-4">
          <textarea
            rows={3}
            id="text-answer-input"
            className="w-full p-4 border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 bg-white font-medium text-base resize-none"
            placeholder={t('type_or_voice', lang)}
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          <button
            id="text-submit-btn"
            disabled={submitting || !textInput.trim()}
            onClick={() => handleSubmitAnswer(textInput.trim())}
            className="w-full py-4 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-base shadow-lg shadow-sky-500/25 transition disabled:opacity-50"
          >
            {submitting ? t('saving_answer', lang) : t('submit_response', lang)}
          </button>
        </div>
      )}
    </div>
  )
}
