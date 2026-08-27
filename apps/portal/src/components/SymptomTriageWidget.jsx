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
    ? { level: 'EMERGENCY RED-FLAG', color: 'border-red-500 bg-red-950/40 text-red-400', badge: 'bg-red-500 text-white', status: 'Immediate Priority Triage & Escalation Triggered' }
    : selectedSymptoms.length > 0
    ? { level: 'ROUTINE CLINICAL REVIEW', color: 'border-blue-500 bg-blue-950/40 text-blue-400', badge: 'bg-blue-500 text-white', status: 'Standard Queue Assignment' }
    : { level: 'NO SYMPTOMS SELECTED', color: 'border-slate-800 bg-slate-900 text-slate-500', badge: 'bg-slate-700 text-slate-300', status: 'Select symptoms above to evaluate' }

  return (
    <section id="triage" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <span className="text-xs font-semibold px-3 py-1 bg-red-900/40 border border-red-700/50 text-red-300 rounded-full uppercase tracking-widest">
          Deterministic Safety Engine
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          Real-Time Red-Flag Triage Simulator
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Our Python rule engine evaluates intake symptoms deterministically without AI hallucination risk, guaranteeing instant emergency escalation when critical red flags are detected.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Symptom Selection Panel */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-700 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Select Patient Symptoms</h3>
            <span className="text-xs text-slate-400 font-mono">Touch Kiosk Input</span>
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
                        ? 'bg-red-500/20 border-red-400 text-red-300'
                        : 'bg-teal-500/20 border-teal-400 text-teal-300'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
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
        <div className={`p-6 sm:p-8 rounded-2xl border transition-all space-y-6 ${triageResult.color}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-slate-400">
              Triage Output Matrix
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${triageResult.badge}`}>
              {triageResult.level}
            </span>
          </div>

          <div className="space-y-2">
            <h4 className="text-2xl font-bold text-white">{triageResult.status}</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {hasCritical
                ? 'CRITICAL WARNING: High-severity red flags detected. System dispatches immediate WebSocket escalation to on-duty doctors and triggers priority alert banner.'
                : 'Routine clinical consultation scheduled. All responses logged for doctor summary review.'}
            </p>
          </div>

          {/* Evidence Log Mockup */}
          <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5">
            <p className="text-slate-500">// Rule Evaluation Log (Phase 5 Engine):</p>
            {selectedSymptoms.map((sym) => (
              <p key={sym} className="text-slate-300">
                &gt; EVALUATE: <span className="text-teal-400">{sym}</span> → Match: {availableSymptoms.find(s => s.label === sym)?.severe ? <span className="text-red-400 font-bold">RED_FLAG_CRITICAL</span> : <span className="text-blue-400">ROUTINE</span>}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
