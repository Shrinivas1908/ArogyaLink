import { useState, useEffect } from 'react'

/**
 * Adaptive Clinical Intake Questionnaire (Phase 4) — Light White & Sky Blue Theme
 */
export default function IntakeQuestionnaire({ encounterId, onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [isComplete, setIsComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Input state for active question
  const [selectedSingle, setSelectedSingle] = useState('')
  const [selectedMulti, setSelectedMulti] = useState([])
  const [textInput, setTextInput] = useState('')

  const fetchNextQuestion = async () => {
    if (!encounterId) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/intake/next-question?encounter_id=${encounterId}`)
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

  if (loading) {
    return (
      <div className="w-full bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-3 shadow-md">
        <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Loading next clinical question…</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="w-full bg-white rounded-3xl border border-sky-200 p-8 text-center space-y-4 shadow-lg">
        <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold shadow-sm">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-900">Adaptive Intake Completed</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto">
          All required clinical intake questions have been answered and securely recorded.
        </p>
        <div className="p-4 bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold rounded-2xl">
          Deterministic Red-Flag Evaluation Triggered (Phase 5).
        </div>
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

      {/* Header Category Pill */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider px-3.5 py-1 bg-sky-100 text-sky-800 rounded-full border border-sky-200">
          {currentQuestion.category || 'Intake Question'}
        </span>
        {currentQuestion.required && (
          <span className="text-xs text-slate-400 font-semibold">Required</span>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
        {currentQuestion.text}
      </h3>

      {/* Single Select Question Type */}
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

      {/* Multi Select Question Type */}
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

      {/* Text Question Type */}
      {currentQuestion.type === 'text' && (
        <div className="space-y-4">
          <textarea
            rows={3}
            className="w-full p-4 border border-sky-200 rounded-2xl focus:ring-2 focus:ring-sky-500 outline-none text-slate-800 bg-white font-medium"
            placeholder="Type your response here..."
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
  )
}
