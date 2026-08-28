import React, { useState, useEffect } from 'react'

export default function InteractiveDoctorWorkspace() {
  const [encounters, setEncounters] = useState([])
  const [selectedEncounter, setSelectedEncounter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [escalationAlert, setEscalationAlert] = useState(null)
  const [actionMessage, setActionMessage] = useState(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [abhaInput, setAbhaInput] = useState('')

  // 1. Fetch live queue from GET /api/queue/encounters/portal (no auth required)
  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue/encounters/portal')
      if (res.ok) {
        const data = await res.json()
        // API returns a plain list (not {encounters:[]})
        setEncounters(Array.isArray(data) ? data : [])
      } else {
        setEncounters([])
      }
    } catch (e) {
      console.error('Failed to fetch doctor queue:', e)
      setEncounters([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  // 2. Connect WebSocket for Real-Time Escalations
  useEffect(() => {
    let ws
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/notifications')
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'CRITICAL_ESCALATION') {
            setEscalationAlert(msg.data)
            fetchQueue()
          }
        } catch (err) {
          console.error('WS JSON parse error:', err)
        }
      }
    } catch (e) {
      console.warn('WebSocket connection warning:', e)
    }
    return () => {
      if (ws) ws.close()
    }
  }, [])

  // 3. Fetch detailed clinical bundle for selected encounter (public portal endpoint)
  const handleSelectEncounter = async (encId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/queue/encounter/${encId}/portal`)
      if (res.ok) {
        const data = await res.json()
        setSelectedEncounter(data)
      }
    } catch (e) {
      console.error('Failed to load encounter bundle:', e)
    } finally {
      setLoading(false)
    }
  }

  // 4. Handle Doctor Approval
  const handleApproveSummary = async () => {
    if (!selectedEncounter) return
    try {
      const res = await fetch('/api/audit/approve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: selectedEncounter.encounter_id }),
      })
      if (res.ok) {
        setActionMessage('✅ Clinical summary approved and signed into medical record.')
        setTimeout(() => setActionMessage(null), 4000)
      }
    } catch (e) {
      console.error('Approval failed:', e)
    }
  }

  // 5. Handle Doctor Override
  const handleOverrideSummary = async () => {
    if (!selectedEncounter || !overrideReason.trim()) return
    try {
      const res = await fetch('/api/audit/override-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: selectedEncounter.encounter_id,
          edited_summary: selectedEncounter.gemini_summary,
          override_reason: overrideReason.trim(),
        }),
      })
      if (res.ok) {
        setActionMessage('⚡ Clinical summary override recorded with audit rationale.')
        setOverrideReason('')
        setTimeout(() => setActionMessage(null), 4000)
      }
    } catch (e) {
      console.error('Override failed:', e)
    }
  }

  // 6. Link ABHA Digital Health Record
  const handleLinkABHA = async () => {
    if (!selectedEncounter || !abhaInput.trim()) return
    try {
      const res = await fetch('/api/fhir/link-abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: selectedEncounter.encounter_id,
          abha_number: abhaInput.trim(),
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setActionMessage(`🔗 ABHA Card Linked! ABDM Txn: ${data.abdm_result?.abdm_link?.transaction_id}`)
        setAbhaInput('')
        setTimeout(() => setActionMessage(null), 5000)
      }
    } catch (e) {
      console.error('ABHA link failed:', e)
    }
  }

  // 7. Download FHIR R4 Bundle JSON
  const handleDownloadFHIR = async () => {
    if (!selectedEncounter) return
    try {
      const res = await fetch(`/api/fhir/encounter/${selectedEncounter.encounter_id}`)
      if (res.ok) {
        const bundle = await res.json()
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2))
        const downloadAnchor = document.createElement('a')
        downloadAnchor.setAttribute('href', dataStr)
        downloadAnchor.setAttribute('download', `arogyalink-fhir-${selectedEncounter.encounter_id.slice(0, 8)}.json`)
        document.body.appendChild(downloadAnchor)
        downloadAnchor.click()
        downloadAnchor.remove()
        setActionMessage('📄 FHIR R4 Bundle downloaded successfully!')
        setTimeout(() => setActionMessage(null), 4000)
      }
    } catch (e) {
      console.error('Download FHIR failed:', e)
    }
  }

  const filteredEncounters = encounters.filter((e) => {
    if (filterSeverity === 'ALL') return true
    return (e.triage_level || 'ROUTINE').toUpperCase() === filterSeverity
  })

  return (
    <div className="w-full space-y-6">
      {/* Real-time Emergency Escalation Banner */}
      {escalationAlert && (
        <div className="bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex items-center justify-between shadow-xl animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center text-xl">
              🚨
            </div>
            <div>
              <h4 className="font-extrabold text-red-900 text-base">CRITICAL EMERGENCY ESCALATION DETECTED</h4>
              <p className="text-xs text-red-700 font-semibold">
                Patient ID: {escalationAlert.encounter_id?.slice(0, 8)} · Triage: {escalationAlert.triage_level}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleSelectEncounter(escalationAlert.encounter_id)
              setEscalationAlert(null)
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
          >
            Review Immediately →
          </button>
        </div>
      )}

      {/* Action Notification Message */}
      {actionMessage && (
        <div className="bg-sky-50 border border-sky-300 text-sky-900 text-sm font-bold p-4 rounded-2xl shadow-sm text-center">
          {actionMessage}
        </div>
      )}

      {/* Workspace Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-3xl shadow-sm bg-white/90">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600">On-Duty Clinical Queue</span>
          <h3 className="text-2xl font-extrabold text-slate-900">Doctor Review Workspace</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Real-time deterministic red-flag triage, Gemini AI summaries & ABDM interoperability.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 bg-sky-100/60 rounded-2xl border border-sky-200 text-xs font-bold">
          {['ALL', 'CRITICAL', 'URGENT', 'ROUTINE'].map((sev) => (
            <button
              key={sev}
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl transition ${
                filterSeverity === sev
                  ? 'bg-white text-sky-900 shadow-sm font-extrabold border border-sky-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Queue & Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Live Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Triage Queue ({filteredEncounters.length} Patients)
          </h4>

          {loading && filteredEncounters.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-8 text-center text-slate-400 font-semibold text-xs">
              Loading clinical queue…
            </div>
          ) : filteredEncounters.length === 0 ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-8 text-center text-slate-500 font-medium text-xs">
              No patients matching severity filter.
            </div>
          ) : (
            filteredEncounters.map((enc) => {
              const isSelected = selectedEncounter?.encounter_id === enc.id
              const sev = (enc.triage_level || 'ROUTINE').toUpperCase()
              const isCrit = sev === 'CRITICAL'
              const isUrg = sev === 'URGENT'

              return (
                <div
                  key={enc.id}
                  onClick={() => handleSelectEncounter(enc.id)}
                  className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-white border-sky-500 shadow-md ring-2 ring-sky-500/20'
                      : isCrit
                      ? 'bg-red-50/70 border-red-200 hover:border-red-400'
                      : 'bg-white border-sky-100 hover:border-sky-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">
                      #{enc.id.slice(0, 8)}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${
                        isCrit
                          ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                          : isUrg
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {sev}
                    </span>
                  </div>

                  <h5 className="text-base font-bold text-slate-900 mt-2">
                    {enc.patient_name || 'Anonymous Patient'}
                  </h5>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-sky-100">
                    <span>Status: <strong className="text-slate-800">{enc.status}</strong></span>
                    <span className="text-sky-600 font-bold">
                      Review Bundle →
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Right Column: Detailed Clinical Review Bundle (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEncounter ? (
            <div className="bg-white rounded-3xl border border-sky-200 p-6 sm:p-8 space-y-6 shadow-lg">
              
              {/* Patient Banner */}
              <div className="flex items-center justify-between border-b border-sky-100 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    ID: {selectedEncounter.encounter_id}
                  </span>
                  <h3 className="text-2xl font-extrabold text-slate-900">
                    {selectedEncounter.patient?.full_name || 'Patient Intake File'}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-semibold block">Triage Classification</span>
                  <span className="text-sm font-extrabold text-sky-700 uppercase">
                    {selectedEncounter.triage_level || 'ROUTINE'}
                  </span>
                </div>
              </div>

              {/* Gemini AI Clinical Summary */}
              {selectedEncounter.gemini_summary && (
                <div className="p-5 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800">
                      Gemini AI Clinical Synthesis
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-200 text-sky-900 rounded-md">
                      Pydantic Verified
                    </span>
                  </div>

                  <p className="text-sm font-bold text-slate-900">
                    {selectedEncounter.gemini_summary.chief_complaint}
                  </p>

                  <div className="space-y-1 text-xs text-slate-700">
                    <p><strong>Duration:</strong> {selectedEncounter.gemini_summary.duration}</p>
                    <p><strong>Severity:</strong> {selectedEncounter.gemini_summary.severity}</p>
                  </div>

                  {selectedEncounter.gemini_summary.key_findings?.length > 0 && (
                    <div className="pt-2">
                      <span className="text-xs font-bold text-slate-800 block mb-1">Key Intake Findings:</span>
                      <ul className="list-disc list-inside text-xs text-slate-600 space-y-1">
                        {selectedEncounter.gemini_summary.key_findings.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Contradiction Detection Flags */}
              {selectedEncounter.contradictions?.has_contradiction && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                    ⚠️ Contradiction Flags Detected
                  </h4>
                  <ul className="list-disc list-inside text-xs space-y-1">
                    {selectedEncounter.contradictions.flags.map((flag, idx) => (
                      <li key={idx}>{flag.description || flag}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Doctor Approval & Override Controls */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-sky-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  Doctor Signature & Approval Actions
                </h4>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApproveSummary}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition"
                  >
                    ✓ Approve & Sign Summary
                  </button>
                  <button
                    onClick={handleDownloadFHIR}
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition"
                  >
                    ⬇️ Download FHIR R4 JSON
                  </button>
                  <a
                    href={`/api/fhir/encounter/${selectedEncounter.encounter_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-white border border-sky-300 text-sky-800 hover:bg-sky-50 font-bold text-xs shadow-sm transition flex items-center gap-1"
                  >
                    📄 View FHIR API
                  </a>
                </div>

                {/* Override Form */}
                <div className="pt-2 space-y-2 border-t border-slate-200">
                  <input
                    type="text"
                    placeholder="Rationale for summary override (e.g. Corrected intake symptom)..."
                    className="w-full text-xs p-3 border border-sky-200 rounded-xl bg-white font-medium outline-none focus:ring-2 focus:ring-sky-500"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                  />
                  <button
                    onClick={handleOverrideSummary}
                    disabled={!overrideReason.trim()}
                    className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
                  >
                    Submit Clinical Override
                  </button>
                </div>
              </div>

              {/* ABHA Link Form */}
              <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  ABDM Digital Health Card Linking
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter 14-digit ABHA Number (e.g. 91-4820-9182-3491)"
                    className="flex-1 text-xs p-3 border border-sky-200 rounded-xl bg-white font-medium outline-none focus:ring-2 focus:ring-sky-500"
                    value={abhaInput}
                    onChange={(e) => setAbhaInput(e.target.value)}
                  />
                  <button
                    onClick={handleLinkABHA}
                    disabled={!abhaInput.trim()}
                    className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition disabled:opacity-50"
                  >
                    Link ABHA Card
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-sky-200 p-12 text-center space-y-3 shadow-md">
              <div className="w-12 h-12 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
                🩺
              </div>
              <h4 className="text-xl font-bold text-slate-900">Select a Patient to Review</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Click any patient encounter from the live triage queue on the left to view Gemini summaries, OCR prescriptions & FHIR bundles.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
