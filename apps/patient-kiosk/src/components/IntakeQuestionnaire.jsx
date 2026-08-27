import { useState, useEffect } from 'react'

/**
 * Adaptive Clinical Intake Questionnaire (Phase 4)
 * Server-driven question rendering supporting single-select, multi-select, and text questions.
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
        // Reset local selection states
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
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-medium">Loading next clinical question…</p>
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          ✓
        </div>
        <h3 className="text-2xl font-bold text-slate-800">Adaptive Intake Completed</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          All required clinical intake questions have been answered and securely recorded.
        </p>
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold rounded-xl">
          Deterministic Red-Flag Evaluation Triggered (Phase 5).
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center">
          {error}
        </div>
      )}

      {/* Header Category Pill */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
          {currentQuestion.category || 'Intake Question'}
        </span>
        {currentQuestion.required && (
          <span className="text-xs text-slate-400 font-medium">Required</span>
        )}
      </div>

      {/* Question Text */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 leading-snug">
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
              className="w-full p-4 rounded-xl border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-left font-semibold text-slate-700 transition flex items-center justify-between group disabled:opacity-50"
            >
              <span>{opt.label}</span>
              <span className="text-blue-500 group-hover:translate-x-1 transition-transform">→</span>
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
                  className={`p-4 rounded-xl border-2 text-left font-semibold transition flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span className="text-sm">{opt.label}</span>
                  <span className={`w-5 h-5 rounded border flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
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
            className="w-full py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base shadow-lg transition disabled:opacity-50"
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
            className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
            placeholder="Type your response here..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          <button
            disabled={submitting || !textInput.trim()}
            onClick={() => handleSubmitAnswer(textInput.trim())}
            className="w-full py-4 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-base shadow-lg transition disabled:opacity-50"
          >
            {submitting ? 'Saving Answer…' : 'Submit Response →'}
          </button>
        </div>
      )}
    </div>
  )
}
