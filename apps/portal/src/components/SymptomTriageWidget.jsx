import { useState } from 'react'

export default function SymptomTriageWidget() {
  const [selectedSymptoms, setSelectedSymptoms] = useState(['Chest Pain'])

  const availableSymptoms = [
    { id: 'chest_pain', label: 'Chest Pain or Tightness', severe: true },
    { id: 'breathlessness', label: 'Difficulty Breathing', severe: true },
    { id: 'fever', label: 'High Fever (> 102°F)', severe: false },
    { id: 'headache', label: 'Severe Headache', severe: false },
    { id: 'dizziness', label: 'Dizziness or Fainting', severe: true },
    { id: 'stomach', label: 'Abdominal Pain', severe: false },
  ]

  const toggleSymptom = (label) => {
    if (selectedSymptoms.includes(label)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== label))
    } else {
      setSelectedSymptoms([...selectedSymptoms, label])
    }
  }

  // Triage risk evaluation
  const hasCritical = availableSymptoms.some(
    (item) => selectedSymptoms.includes(item.label) && item.severe
  )

  const triageResult = hasCritical
    ? { level: 'EMERGENCY RED-FLAG', color: 'border-red-300 bg-red-50 text-red-800', badge: 'bg-red-600 text-white', status: 'Immediate Priority Triage & Escalation Triggered' }
    : selectedSymptoms.length > 0
    ? { level: 'ROUTINE CLINICAL REVIEW', color: 'border-sky-300 bg-sky-50 text-sky-900', badge: 'bg-sky-500 text-white', status: 'Standard Queue Assignment' }
    : { level: 'NO SYMPTOMS SELECTED', color: 'border-slate-200 bg-white text-slate-500', badge: 'bg-slate-200 text-slate-700', status: 'Select symptoms above to evaluate' }

  return (
    <section id="triage" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="text-xs font-bold px-3 py-1 bg-red-100 border border-red-300 text-red-700 rounded-full uppercase tracking-widest">
          Deterministic Safety Engine
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Real-Time Red-Flag Triage Simulator
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Our Python rule engine evaluates intake symptoms deterministically without AI hallucination risk, guaranteeing instant emergency escalation when critical red flags are detected.
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
        </div>

        {/* Live Triage Evaluation Output */}
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all space-y-6 shadow-md ${triageResult.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-600">
              Triage Output Matrix
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${triageResult.badge}`}>
              {triageResult.level}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-slate-900">{triageResult.status}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hasCritical
                ? 'CRITICAL WARNING: High-severity red flags detected. System dispatches immediate WebSocket escalation to on-duty doctors and triggers priority alert banner.'
                : 'Routine clinical consultation scheduled. All responses logged for doctor summary review.'}
            </p>
          </div>

          {/* Evidence Log Mockup */}
          <div className="bg-white/90 p-4 rounded-xl border border-sky-200 text-xs font-mono space-y-1.5 shadow-inner">
            <p className="text-slate-400">// Rule Evaluation Log (Phase 5 Engine):</p>
            {selectedSymptoms.map((sym) => (
              <p key={sym} className="text-slate-800">
                &gt; EVALUATE: <span className="text-sky-600 font-bold">{sym}</span> → Match: {availableSymptoms.find(s => s.label === sym)?.severe ? <span className="text-red-600 font-bold">RED_FLAG_CRITICAL</span> : <span className="text-sky-700 font-bold">ROUTINE</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
