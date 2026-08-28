import React, { useState } from 'react'

export default function EncounterDetail({
  encounter,
  onViewEvidence,
  onApprove,
  onDownloadFHIR,
  overrideReason,
  setOverrideReason,
  onOverride,
  abhaInput,
  setAbhaInput,
  onLinkABHA,
}) {
  const [showAiBreakdown, setShowAiBreakdown] = useState(true)

  if (!encounter) return null

  const encId = encounter.encounter_id || encounter.id || 'AL-2048'
  const patientName = encounter.patient?.full_name || encounter.patient_name || 'Ananya Sharma'
  const age = encounter.patient?.age || encounter.age || 54
  const complaint = encounter.chief_complaint || 'Severe chest discomfort'
  const triage = encounter.triage_level || 'Critical'
  const summary = encounter.gemini_summary || encounter.summary || {}

  const diffs = summary.differential_diagnoses || [
    { condition: 'Acute Coronary Syndrome (ACS)', likelihood: 'High', rationale: 'Acute radiating chest pain with dyspnea.' },
    { condition: 'Gastroesophageal Reflux Spasm', likelihood: 'Moderate', rationale: 'Non-ischemic differential presentation.' }
  ]

  const labs = summary.recommended_vitals_and_labs || [
    '12-Lead Electrocardiogram (ECG)',
    'BP & Continuous SpO2 Monitoring',
    'Point-of-Care Cardiac Troponin I/T'
  ]

  return (
    <div className="bg-[#FAF7F2] rounded-[24px] p-6 sm:p-8 border border-[#EFE8DE] shadow-sm space-y-6">
      
      {/* Header tag and Critical badge */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70]">
          ENCOUNTER {encId}
        </span>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FCE8E6] text-[#D9383A]">
          {triage}
        </span>
      </div>

      {/* Patient Name & Subtitle */}
      <div>
        <h2 className="text-3xl font-serif text-[#2E1B15]">
          {patientName}
        </h2>
        <p className="text-sm text-[#7C6C62] mt-1 font-sans">
          {age} years • {complaint}
        </p>
      </div>

      {/* Deterministic Red Flag Banner */}
      <div className="bg-[#FDF0ED] border border-[#FADCD5] rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base text-[#D9383A]">⚠️</span>
          <div>
            <h4 className="text-xs font-bold text-[#8F2A24]">
              Deterministic red flag
            </h4>
            <p className="text-xs text-[#A84B46] mt-0.5">
              {encounter.rule_desc || 'Rule RF-CARD-001 triggered by confirmed intake evidence.'}
            </p>
          </div>
        </div>

        <button
          onClick={onViewEvidence}
          className="text-xs font-medium text-[#8F2A24] hover:underline shrink-0 ml-2"
        >
          View evidence &gt;
        </button>
      </div>

      {/* AI Clinical Decision Synthesis Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#12322B] animate-pulse" />
            <h3 className="text-xs font-bold text-[#2E1B15] uppercase tracking-wider">
              AI Clinical Decision Synthesis (Groq & Gemini)
            </h3>
          </div>
          <button
            onClick={() => setShowAiBreakdown(!showAiBreakdown)}
            className="text-[11px] font-semibold text-[#8C7A70] hover:text-[#2E1B15]"
          >
            {showAiBreakdown ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>

        {showAiBreakdown && (
          <div className="space-y-4 pt-2 border-t border-[#FAF6F0] text-xs">
            {summary.history_of_present_illness && (
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C7A70]">History of Present Illness:</span>
                <p className="text-[#2E1B15] mt-1 leading-relaxed">{summary.history_of_present_illness}</p>
              </div>
            )}

            {/* Differential Diagnoses */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A70]">Differential Diagnoses:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
                {diffs.map((d, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE]">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#2E1B15]">{d.condition}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        d.likelihood === 'High' ? 'bg-[#FCE8E6] text-[#D9383A]' : 'bg-[#E4EDE9] text-[#12322B]'
                      }`}>{d.likelihood}</span>
                    </div>
                    <p className="text-[11px] text-[#7C6C62] mt-1">{d.rationale}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Labs & Vitals */}
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A70]">Recommended Investigations & Vitals:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {labs.map((lab, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EFE8DE] text-[#2E1B15] text-[11px]">
                    ✦ {lab}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2-Column Sub-Cards: Patient-reported intake & Document evidence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* Card 1: Patient-reported intake */}
        <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2E1B15]">
            <svg className="w-4 h-4 text-[#8C7A70]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <span>Patient-reported intake</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
              <span className="text-[#8C7A70]">Severity</span>
              <span className="font-bold text-[#2E1B15]">9 / 10</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#FAF6F0]">
              <span className="text-[#8C7A70]">Breathing difficulty</span>
              <span className="font-bold text-[#2E1B15]">Yes</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8C7A70]">Radiating pain</span>
              <span className="font-bold text-[#2E1B15]">Yes — left shoulder</span>
            </div>
          </div>
        </div>

        {/* Card 2: Document evidence */}
        <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#2E1B15]">
            <svg className="w-4 h-4 text-[#8C7A70]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Document evidence</span>
          </div>

          <p className="text-xs text-[#7C6C62] leading-relaxed">
            Previous report processed. OCR extraction available for verification.
          </p>

          <button
            onClick={onDownloadFHIR}
            className="text-xs font-bold text-[#6E3E30] hover:underline block pt-1"
          >
            Inspect OCR extraction →
          </button>
        </div>

      </div>

      {/* Doctor Clinical Actions Bar */}
      <div className="pt-4 border-t border-[#EFE8DE] space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onApprove}
            className="px-5 py-2.5 rounded-full bg-[#2E1B15] text-[#FAF6F0] hover:bg-[#3D251D] text-xs font-bold transition shadow-sm"
          >
            ✓ Approve & Sign Record
          </button>
          <button
            onClick={onDownloadFHIR}
            className="px-4 py-2.5 rounded-full bg-white border border-[#EFE8DE] text-[#2E1B15] hover:bg-[#F2E5D5] text-xs font-bold transition shadow-sm"
          >
            ⬇ FHIR R4 Bundle
          </button>
        </div>

        {/* Override Rationale Form */}
        <div className="flex gap-2 pt-2">
          <input
            type="text"
            placeholder="Doctor override rationale (e.g. Adjusted diagnosis)..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#EFE8DE] text-xs outline-none focus:border-[#6E3E30]"
          />
          <button
            onClick={onOverride}
            disabled={!overrideReason.trim()}
            className="px-4 py-2 rounded-xl bg-[#6E3E30] text-white text-xs font-bold disabled:opacity-40 transition"
          >
            Override
          </button>
        </div>

        {/* ABHA Link Form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Link ABHA ID (e.g. 91-4820-9182-3491)"
            value={abhaInput}
            onChange={(e) => setAbhaInput(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#EFE8DE] text-xs outline-none focus:border-[#6E3E30]"
          />
          <button
            onClick={onLinkABHA}
            disabled={!abhaInput.trim()}
            className="px-4 py-2 rounded-xl bg-[#2E1B15] text-[#FAF6F0] text-xs font-bold disabled:opacity-40 transition"
          >
            Link ABHA
          </button>
        </div>

      </div>

    </div>
  )
}
