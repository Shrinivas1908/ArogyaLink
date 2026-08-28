import React, { useState } from 'react'

export default function SymptomTriageWidget() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([])
  const [triageResult, setTriageResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState(null)

  const availableSymptoms = [
    { id: 'chest_pain', label: 'Chest Pain or Tightness', severe: true },
    { id: 'breathlessness', label: 'Difficulty Breathing', severe: true },
    { id: 'fever', label: 'High Fever (> 102°F)', severe: false },
    { id: 'headache', label: 'Severe Headache', severe: false },
    { id: 'dizziness', label: 'Dizziness or Fainting', severe: true },
    { id: 'stomach', label: 'Abdominal Pain', severe: false },
  ]

  const toggleSymptom = (label) => {
    setTriageResult(null)
    setApiError(null)
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label))
    } else {
      setSelectedSymptoms([...selectedSymptoms, label])
    }
  }

  const handleRunTriage = async () => {
    if (selectedSymptoms.length === 0) return
    setLoading(true)
    setApiError(null)
    setTriageResult(null)

    try {
      const res = await fetch('/api/triage/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: selectedSymptoms }),
      })
      if (res.ok) {
        const data = await res.json()
        setTriageResult(data)
      } else {
        setApiError('Backend triage engine returned an error. Check server logs.')
      }
    } catch (err) {
      setApiError('Cannot reach backend. Ensure FastAPI is running on port 8000.')
    } finally {
      setLoading(false)
    }
  }

  const isCritical = triageResult?.triage_level === 'CRITICAL'
  const isUrgent = triageResult?.triage_level === 'URGENT'

  const resultStyle = isCritical
    ? 'border-red-400 bg-red-50'
    : isUrgent
    ? 'border-amber-400 bg-amber-50'
    : 'border-sky-300 bg-sky-50'

  const badgeStyle = isCritical
    ? 'bg-red-600 text-white animate-pulse'
    : isUrgent
    ? 'bg-amber-500 text-white'
    : 'bg-emerald-500 text-white'

  return (
    <section id="triage" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="text-xs font-bold px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded-full uppercase tracking-widest">
          Deterministic Safety Engine — Live API
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Real-Time Red-Flag Triage Engine
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Select symptoms and click <strong>Run Live Triage</strong> — results come directly from the Python
          red-flag engine via <code className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-xs font-mono">POST /api/triage/demo</code>.
          No AI hallucination. Deterministic rules from <code className="bg-sky-100 text-sky-800 px-1.5 py-0.5 rounded text-xs font-mono">red_flags.json</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Symptom Selection Panel */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-sky-200 space-y-6 shadow-md">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Select Patient Symptoms</h3>
            <span className="text-xs text-sky-600 font-mono font-semibold">Touch Kiosk Input</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {availableSymptoms.map((item) => {
              const isSelected = selectedSymptoms.includes(item.label)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleSymptom(item.label)}
                  className={`p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between ${
                    isSelected
                      ? item.severe
                        ? 'bg-red-50 border-red-400 text-red-700 font-bold shadow-sm'
                        : 'bg-sky-500 border-sky-500 text-white font-bold shadow-sm'
                      : 'bg-white border-sky-200 text-slate-700 hover:border-sky-300'
                  }`}
                >
                  <span>{item.label}</span>
                  {isSelected && <span>✓</span>}
                </button>
              )
            })}
          </div>

          <button
            onClick={handleRunTriage}
            disabled={loading || selectedSymptoms.length === 0}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold text-sm shadow-md shadow-red-500/25 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Evaluating Red-Flag Rules…
              </>
            ) : (
              '⚡ Run Live Triage via Backend API →'
            )}
          </button>

          {apiError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-semibold">
              ⚠️ {apiError}
            </div>
          )}
        </div>

        {/* Live Triage Evaluation Output */}
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all space-y-6 shadow-md ${triageResult ? resultStyle : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-600">
              Triage Output Matrix
            </span>
            {triageResult && (
              <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${badgeStyle}`}>
                {triageResult.triage_level}
              </span>
            )}
          </div>

          {!triageResult && !loading && (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 bg-sky-100 text-sky-500 rounded-full flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <p className="text-slate-400 text-xs font-semibold">
                Select symptoms and click "Run Live Triage" to get real engine results
              </p>
            </div>
          )}

          {triageResult && (
            <>
              <div className="space-y-2">
                <h4 className={`text-xl font-bold ${isCritical ? 'text-red-900' : isUrgent ? 'text-amber-900' : 'text-slate-900'}`}>
                  {isCritical
                    ? '🚨 EMERGENCY — Immediate Escalation Required'
                    : isUrgent
                    ? '⚠️ URGENT — Priority Queue Assignment'
                    : '✅ ROUTINE — Standard Clinical Consultation'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {isCritical
                    ? 'CRITICAL: High-severity red flags detected by Python engine. WebSocket alert dispatched to on-duty doctors.'
                    : isUrgent
                    ? 'URGENT flags detected. Patient requires prompt review within the hour.'
                    : 'No critical red flags. Routine consultation scheduled and logged.'}
                </p>
              </div>

              {/* Evidence Log from Backend */}
              <div className="bg-white/90 p-4 rounded-xl border border-sky-200 text-xs font-mono space-y-2 shadow-inner">
                <p className="text-slate-400">// Red-Flag Engine Response (red_flags.json rules):</p>
                <p className="text-slate-600">
                  &gt; has_red_flags: <span className={triageResult.has_red_flags ? 'text-red-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {String(triageResult.has_red_flags)}
                  </span>
                </p>
                <p className="text-slate-600">
                  &gt; immediate_escalation: <span className={triageResult.requires_immediate_escalation ? 'text-red-600 font-bold' : 'text-slate-600'}>
                    {String(triageResult.requires_immediate_escalation)}
                  </span>
                </p>
                {triageResult.triggered_flags?.length > 0 ? (
                  <>
                    <p className="text-slate-400 pt-1">// Triggered Rules:</p>
                    {triageResult.triggered_flags.map((flag, i) => (
                      <p key={i} className="text-red-700 font-bold">
                        &gt; FLAG[{i + 1}]: {typeof flag === 'string' ? flag : (flag.rule_id || flag.description || JSON.stringify(flag))}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-emerald-600">&gt; No critical flags triggered</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
