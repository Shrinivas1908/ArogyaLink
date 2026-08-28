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
  const [detailTab, setDetailTab] = useState('clinical') // 'clinical' | 'ayush' | 'ocr' | 'fhir'
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
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
          triage.toUpperCase() === 'CRITICAL'
            ? 'bg-[#FCE8E6] text-[#D9383A]'
            : triage.toUpperCase() === 'URGENT'
            ? 'bg-[#FEF3C7] text-[#D97706]'
            : 'bg-[#E4EDE9] text-[#12322B]'
        }`}>
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
              Deterministic Red Flag Triage
            </h4>
            <p className="text-xs text-[#A84B46] mt-0.5">
              {encounter.rule_desc || 'Rule RF-CARD-001 triggered: immediate clinical attention advised.'}
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

      {/* Multi-Module Clinical Navigation Tabs */}
      <div className="flex gap-2 p-1 bg-white rounded-xl border border-[#EFE8DE] text-xs font-bold">
        <button
          onClick={() => setDetailTab('clinical')}
          className={`flex-1 py-2 rounded-lg transition ${
            detailTab === 'clinical' ? 'bg-[#2E1B15] text-[#FAF6F0]' : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          🩺 AI Synthesis & HPI
        </button>

        <button
          onClick={() => setDetailTab('ayush')}
          className={`flex-1 py-2 rounded-lg transition ${
            detailTab === 'ayush' ? 'bg-[#2E1B15] text-[#FAF6F0]' : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          🌿 AYUSH Pariksha
        </button>

        <button
          onClick={() => setDetailTab('ocr')}
          className={`flex-1 py-2 rounded-lg transition ${
            detailTab === 'ocr' ? 'bg-[#2E1B15] text-[#FAF6F0]' : 'text-[#7C6C62] hover:text-[#2E1B15]'
          }`}
        >
          📄 Rx OCR Extraction
        </button>
      </div>

      {/* ── SUB-TAB 1: AI Clinical Decision Synthesis ─────────────────── */}
      {detailTab === 'clinical' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#12322B] animate-pulse" />
                <h3 className="text-xs font-bold text-[#2E1B15] uppercase tracking-wider">
                  Clinical Synthesis (Groq Llama-3.3 & Gemini 2.5)
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
                    <span className="text-[10px] uppercase font-bold text-[#8C7A70]">History of Present Illness (HPI):</span>
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

          {/* 2-Column Sub-Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-2">
              <span className="text-xs font-bold text-[#2E1B15]">Patient-Reported Intake</span>
              <p className="text-xs text-[#7C6C62]">
                Complaint: <strong className="text-[#2E1B15]">{complaint}</strong>
              </p>
              <p className="text-xs text-[#7C6C62]">
                Triage Assessment: <span className="font-bold text-[#2E1B15]">{triage}</span>
              </p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-2">
              <span className="text-xs font-bold text-[#2E1B15]">ABDM Consent Artefact</span>
              <p className="text-xs text-[#7C6C62]">
                Status: <span className="text-emerald-700 font-bold">✓ Active Digital Consent</span>
              </p>
              <p className="text-xs text-[#7C6C62]">
                Framework: DPDP Act 2023 Compliant
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: AYUSH Dashavidha Assessment ────────────────────── */}
      {detailTab === 'ayush' && (
        <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#2E1B15]">Ayurvedic Prakriti & Dashavidha Pariksha</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E4EDE9] text-[#12322B] font-bold text-[10px]">
              AYUSH Module
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE]">
              <span className="text-[10px] font-bold text-[#8C7A70] uppercase block">Prakriti (Dosha)</span>
              <span className="font-bold text-[#2E1B15] text-sm mt-0.5 block">Vata-Pitta</span>
              <span className="text-[11px] text-[#7C6C62]">Light frame, variable energy</span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE]">
              <span className="text-[10px] font-bold text-[#8C7A70] uppercase block">Agni (Metabolic Fire)</span>
              <span className="font-bold text-[#2E1B15] text-sm mt-0.5 block">Tikshnagni</span>
              <span className="text-[11px] text-[#7C6C62]">High metabolic appetite</span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE]">
              <span className="text-[10px] font-bold text-[#8C7A70] uppercase block">Ahara-Vihara (Diet)</span>
              <span className="font-bold text-[#2E1B15] text-sm mt-0.5 block">Satvik / Veg</span>
              <span className="text-[11px] text-[#7C6C62]">Warm cooked diet advised</span>
            </div>
          </div>
        </div>
      )}

      {/* ── SUB-TAB 3: Document OCR Extraction ────────────────────────── */}
      {detailTab === 'ocr' && (
        <div className="bg-white rounded-2xl p-5 border border-[#EFE8DE] space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-[#2E1B15]">PaddleOCR Medical Document Intelligence</h4>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EFE8DE] text-[#2E1B15] font-bold text-[10px]">
              High Confidence (96%)
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE] flex items-center justify-between">
              <div>
                <strong className="text-[#2E1B15]">Tab. Paracetamol 650mg</strong>
                <p className="text-[11px] text-[#7C6C62]">Antipyretic / Analgesic</p>
              </div>
              <span className="font-mono text-[#2E1B15] font-bold">TDS x 3 Days</span>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#EFE8DE] flex items-center justify-between">
              <div>
                <strong className="text-[#2E1B15]">Tab. Cetirizine 10mg</strong>
                <p className="text-[11px] text-[#7C6C62]">Antihistamine</p>
              </div>
              <span className="font-mono text-[#2E1B15] font-bold">OD (Night)</span>
            </div>
          </div>
        </div>
      )}

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
