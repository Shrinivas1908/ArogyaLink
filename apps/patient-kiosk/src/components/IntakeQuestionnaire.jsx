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

  // ── Completion state ───────────────────────────────────────────────────
  if (isComplete) {
    return (
      <div className="w-full bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-6 shadow-lg">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto text-3xl font-bold shadow-sm">
          ✓
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold text-slate-900">{t('intake_completed_title', lang)}</h3>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{t('intake_completed_sub', lang)}</p>
        </div>
        <div className="p-4 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold rounded-2xl">
          Deterministic Red-Flag Evaluation Triggered & Doctor Queue Updated.
        </div>
        {onRestart && (
          <div className="pt-2">
            <button
              onClick={onRestart}
              className="px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition transform hover:-translate-y-0.5"
            >
              {t('new_patient_checkin', lang)}
            </button>
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
