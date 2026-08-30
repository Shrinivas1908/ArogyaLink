import React, { useState } from 'react'

export default function FHIRExportsView({
  encounters,
  selectedEncounter,
  onSelectEncounter,
  onDownloadFHIR,
  onDeleteEncounter,
  onClearAllEncounters,
}) {
  const [activeEncId, setActiveEncId] = useState(
    selectedEncounter?.encounter_id || selectedEncounter?.id || (encounters[0]?.encounter_id || encounters[0]?.id)
  )
  const [copied, setCopied] = useState(false)
  const [filterType, setFilterType] = useState('ALL') // 'ALL' | 'CRITICAL' | 'ROUTINE'

  const activeEnc = encounters.find(
    (e) => (e.encounter_id || e.id) === activeEncId
  ) || selectedEncounter || encounters[0]

  const fhirBundle = activeEnc
    ? {
        resourceType: 'Bundle',
        type: 'document',
        id: `arogya-${activeEnc.encounter_id || activeEnc.id}`,
        meta: {
          lastUpdated: new Date().toISOString(),
          profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/DocumentBundle'],
        },
        identifier: {
          system: 'https://arogyalink.in/fhir/bundles',
          value: `BUNDLE-${(activeEnc.encounter_id || activeEnc.id || '2048').slice(0, 8)}`,
        },
        timestamp: new Date().toISOString(),
        abdm_compliance: {
          milestone_1: 'ABHA Linkage & Verified Consent',
          milestone_2: 'HIP/HIU Health Information Exchange',
          dpdp_act: 'Compliant (Section 6 DPDP 2023)',
        },
        entry: [
          {
            fullUrl: `urn:uuid:${activeEnc.patient_id || 'pat-01'}`,
            resource: {
              resourceType: 'Patient',
              id: activeEnc.patient_id || 'pat-01',
              name: [{ text: activeEnc.patient_name || 'Patient' }],
              gender: (activeEnc.gender || 'unknown').toLowerCase(),
              birthDate: activeEnc.age ? `${new Date().getFullYear() - activeEnc.age}-01-01` : '1980-01-01',
              telecom: activeEnc.phone ? [{ system: 'phone', value: activeEnc.phone }] : [],
            },
          },
          {
            fullUrl: `urn:uuid:${activeEnc.encounter_id || activeEnc.id}`,
            resource: {
              resourceType: 'Encounter',
              id: activeEnc.encounter_id || activeEnc.id,
              status: 'finished',
              class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: 'AMB', display: 'ambulatory' },
              priority: { coding: [{ code: activeEnc.triage_level || 'ROUTINE' }] },
              period: { start: activeEnc.created_at || new Date().toISOString() },
            },
          },
          {
            fullUrl: `urn:uuid:cond-${(activeEnc.encounter_id || activeEnc.id || '1').slice(0, 6)}`,
            resource: {
              resourceType: 'Condition',
              code: { text: activeEnc.chief_complaint || 'Clinical Intake Assessment' },
              clinicalStatus: { coding: [{ code: 'active' }] },
              verificationStatus: { coding: [{ code: 'confirmed' }] },
            },
          },
          {
            fullUrl: `urn:uuid:consent-${(activeEnc.encounter_id || activeEnc.id || '1').slice(0, 6)}`,
            resource: {
              resourceType: 'Consent',
              status: 'active',
              scope: { coding: [{ code: 'patient-privacy' }] },
              policyRule: { coding: [{ code: 'ABDM-M1-DPDP-2023' }] },
            },
          },
        ],
      }
    : null

  const handleCopyJson = () => {
    if (!fhirBundle) return
    navigator.clipboard.writeText(JSON.stringify(fhirBundle, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const handleDownloadSingle = (enc) => {
    const encId = enc?.encounter_id || enc?.id || 'export'
    const bundleToDownload = activeEncId === encId ? fhirBundle : {
      resourceType: 'Bundle',
      type: 'document',
      id: `arogya-${encId}`,
      patient: enc.patient_name,
      triage: enc.triage_level,
      timestamp: new Date().toISOString(),
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundleToDownload, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `arogyalink-fhir-${encId.slice(0, 8)}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const handleDownloadAllBundles = () => {
    if (!encounters || encounters.length === 0) return
    const masterBundle = {
      resourceType: 'Bundle',
      type: 'batch',
      id: `arogyalink-abdm-export-${new Date().toISOString().slice(0, 10)}`,
      total: encounters.length,
      timestamp: new Date().toISOString(),
      bundles: encounters.map((e) => ({
        encounter_id: e.encounter_id || e.id,
        patient_name: e.patient_name,
        triage_level: e.triage_level,
        chief_complaint: e.chief_complaint,
        created_at: e.created_at,
      })),
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(masterBundle, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `arogyalink-abdm-master-export.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  const filtered = encounters.filter((e) => {
    if (filterType === 'ALL') return true
    return (e.triage_level || 'ROUTINE').toUpperCase() === filterType
  })

  return (
    <div className="space-y-6">
      {/* ── Top Header & Stats Card ────────────────────────────────────── */}
      <div className="bg-[#FAF7F2] rounded-[24px] p-6 sm:p-8 border border-[#EFE8DE] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
              HL7 FHIR R4 · ABDM HEALTH DATA EXCHANGE
            </span>
            <h3 className="text-2xl font-serif text-[#2E1B15] mt-0.5">
              Organized FHIR R4 Bundle Directory
            </h3>
            <p className="text-xs text-[#7C6C62] mt-1">
              Standardized interoperable clinical summaries compliant with Ayushman Bharat Digital Mission (ABDM).
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadAllBundles}
              disabled={encounters.length === 0}
              className="px-4 py-2.5 rounded-full bg-[#12322B] text-white text-xs font-bold hover:bg-[#1E4A40] transition shadow-sm disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
            >
              <span>📦</span>
              <span>Bulk Export All ({encounters.length})</span>
            </button>

            {onClearAllEncounters && (
              <button
                onClick={onClearAllEncounters}
                disabled={encounters.length === 0}
                className="px-4 py-2.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold hover:bg-rose-100 transition shadow-sm disabled:opacity-40 flex items-center gap-1.5 active:scale-95"
              >
                <span>🗑️</span>
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        {/* ABDM Compliance Status Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-white rounded-2xl border border-[#EFE8DE] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A70] block">ABDM Milestone 1</span>
              <strong className="text-xs text-[#2E1B15]">ABHA Verification & Consent</strong>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#EFE8DE] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A70] block">ABDM Milestone 2</span>
              <strong className="text-xs text-[#2E1B15]">HIP / HIU Telemetry</strong>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          </div>

          <div className="p-3.5 bg-white rounded-2xl border border-[#EFE8DE] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C7A70] block">Data Privacy</span>
              <strong className="text-xs text-[#2E1B15]">DPDP Act 2023 Compliant</strong>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Directory Explorer ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Encounter Directory List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FAF7F2] rounded-[24px] p-5 border border-[#EFE8DE] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#2E1B15]">
                Exportable Encounters ({filtered.length})
              </h4>
              <div className="flex gap-1 bg-white p-1 rounded-xl border border-[#EFE8DE] text-[10px] font-bold">
                <button
                  onClick={() => setFilterType('ALL')}
                  className={`px-2.5 py-1 rounded-lg transition ${filterType === 'ALL' ? 'bg-[#2E1B15] text-white' : 'text-[#7C6C62]'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('CRITICAL')}
                  className={`px-2.5 py-1 rounded-lg transition ${filterType === 'CRITICAL' ? 'bg-red-700 text-white' : 'text-[#7C6C62]'}`}
                >
                  Critical
                </button>
                <button
                  onClick={() => setFilterType('ROUTINE')}
                  className={`px-2.5 py-1 rounded-lg transition ${filterType === 'ROUTINE' ? 'bg-emerald-700 text-white' : 'text-[#7C6C62]'}`}
                >
                  Routine
                </button>
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-[#EFE8DE] space-y-2">
                <span className="text-2xl block">📂</span>
                <p className="text-xs font-semibold text-[#2E1B15]">No encounters in queue</p>
                <p className="text-[11px] text-[#7C6C62]">Complete a kiosk intake to generate new FHIR bundles.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[500px] overflow-y-auto">
                {filtered.map((enc) => {
                  const id = enc.encounter_id || enc.id
                  const isSelected = id === activeEncId
                  return (
                    <div
                      key={id}
                      onClick={() => {
                        setActiveEncId(id)
                        if (onSelectEncounter) onSelectEncounter(id)
                      }}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-left space-y-2 ${
                        isSelected
                          ? 'bg-white border-[#2E1B15] shadow-md ring-1 ring-[#2E1B15]'
                          : 'bg-white border-[#EFE8DE] hover:border-[#BFD8D2]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#2E1B15]">
                          {enc.patient_name || 'Patient'}
                        </span>
                        <span
                          className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            (enc.triage_level || '').toUpperCase() === 'CRITICAL'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {enc.triage_level || 'ROUTINE'}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#7C6C62] line-clamp-1">
                        {enc.chief_complaint || 'Clinical Intake Assessment'}
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t border-[#FAF7F2] text-[10px]">
                        <span className="font-mono text-[#8C7A70]">ID: {id.slice(0, 8)}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDownloadSingle(enc)
                            }}
                            className="text-emerald-700 hover:text-emerald-900 font-bold underline"
                          >
                            ⬇ JSON
                          </button>
                          {onDeleteEncounter && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (window.confirm(`Delete encounter ${id.slice(0, 8)}?`)) {
                                  onDeleteEncounter(id)
                                }
                              }}
                              className="text-rose-600 hover:text-rose-800 font-bold underline ml-1"
                            >
                              ✕ Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Structured FHIR JSON Schema Viewer */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#FAF7F2] rounded-[24px] p-6 sm:p-7 border border-[#EFE8DE] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
                  RESOURCE SCHEMA INSPECTOR
                </span>
                <h4 className="text-lg font-serif font-bold text-[#2E1B15]">
                  Bundle/{activeEnc ? (activeEnc.encounter_id || activeEnc.id || '2048').slice(0, 8) : 'None'}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  disabled={!fhirBundle}
                  className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-bold text-[#2E1B15] hover:bg-[#FAF7F2] transition shadow-2xs active:scale-95 disabled:opacity-40"
                >
                  {copied ? '✓ Copied!' : '📋 Copy JSON'}
                </button>
                <button
                  onClick={() => handleDownloadSingle(activeEnc)}
                  disabled={!activeEnc}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2E1B15] text-[#FAF6F0] text-xs font-bold hover:bg-[#3D251D] transition shadow-sm active:scale-95 disabled:opacity-40"
                >
                  ⬇ Download
                </button>
              </div>
            </div>

            {/* Included Resources Pill Summary */}
            {fhirBundle && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Bundle (document)', 'Patient', 'Encounter', 'Condition', 'Consent'].map((res, i) => (
                  <span key={i} className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-[#BFD8D2] text-[#12322B]">
                    ✓ {res}
                  </span>
                ))}
              </div>
            )}

            {/* JSON Code Box */}
            <div className="p-4 rounded-2xl bg-[#2E1B15] text-[#E4EDE9] font-mono text-[11px] overflow-x-auto max-h-[460px] border border-slate-700 shadow-inner">
              <pre className="whitespace-pre">
                {fhirBundle ? JSON.stringify(fhirBundle, null, 2) : '// No active encounter selected'}
              </pre>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
