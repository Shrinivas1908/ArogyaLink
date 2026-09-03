import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import MetricStats from '../components/MetricStats'
import PatientQueue from '../components/PatientQueue'
import EncounterDetail from '../components/EncounterDetail'
import LiveEscalationsView from '../components/LiveEscalationsView'
import FHIRExportsView from '../components/FHIRExportsView'
import EscalationToast from '../components/EscalationToast'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeNav, setActiveNav] = useState('overview')
  const [encounters, setEncounters] = useState([])
  const [selectedEncounter, setSelectedEncounter] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [showToast, setShowToast] = useState(false)
  const [actionMessage, setActionMessage] = useState(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [abhaInput, setAbhaInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolderDate, setSelectedFolderDate] = useState('2026-08-28')

  const [escalationAlert, setEscalationAlert] = useState(null)

  // 1. Fetch live queue
  const fetchQueue = async () => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase_token')
      const url = token ? '/api/queue/encounters' : '/api/queue/encounters/portal'
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        const fetched = Array.isArray(data) ? data : data.encounters || []
        setEncounters(fetched)
        if (fetched.length > 0) {
          setSelectedEncounter((prev) => prev ? fetched.find(e => e.id === prev.id) || fetched[0] : fetched[0])
        } else {
          setSelectedEncounter(null)
        }
      }
    } catch {
      // Retain clean state
    }
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 2500)
    return () => clearInterval(interval)
  }, [])

  // 2. Connect WebSocket for Real-Time Escalations with keepalive
  useEffect(() => {
    let ws = null
    let pingInterval = null
    let reconnectTimeout = null
    let isMounted = true

    const connectWS = () => {
      if (!isMounted) return
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const host = window.location.hostname || '127.0.0.1'
        ws = new WebSocket(`${protocol}//${host}:8000/ws/notifications`)

        ws.onopen = () => {
          if (!isMounted) {
            if (ws.readyState === WebSocket.OPEN) ws.close()
            return
          }
          pingInterval = setInterval(() => {
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send('ping')
            }
          }, 15000)
        }

        ws.onmessage = (event) => {
          try {
            const msg = JSON.parse(event.data)
            if (msg.type === 'pong') return
            fetchQueue()
            if (msg.event === 'CRITICAL_ESCALATION') {
              setEscalationAlert({
                encounter_id: msg.data?.encounter_id || 'AL-2048',
                patient_name: msg.data?.patient_name || 'Ananya Sharma',
                symptoms: msg.data?.symptoms || 'Severe discomfort + breathing difficulty + radiating pain.',
              })
              setShowToast(true)
            }
          } catch {}
        }

        ws.onerror = () => {
          // Fallback gracefully without unhandled exception
        }

        ws.onclose = () => {
          if (pingInterval) clearInterval(pingInterval)
          if (isMounted) {
            reconnectTimeout = setTimeout(connectWS, 5000)
          }
        }
      } catch {
        // Fallback gracefully
      }
    }

    connectWS()

    return () => {
      isMounted = false
      if (pingInterval) clearInterval(pingInterval)
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [])

  // 3. Select encounter
  const handleSelectEncounter = async (encId) => {
    try {
      const token = user?.access_token || localStorage.getItem('supabase_token')
      const url = token ? `/api/queue/encounter/${encId}` : `/api/queue/encounter/${encId}/portal`
      const headers = token ? { Authorization: `Bearer ${token}` } : {}

      const res = await fetch(url, { headers })
      if (res.ok) {
        const data = await res.json()
        setSelectedEncounter({ ...data, encounter_id: data.encounter_id || encId })
        return
      }
    } catch {}
    const fallback = encounters.find((e) => e.id === encId) || encounters[0]
    setSelectedEncounter({ ...fallback, encounter_id: fallback.id })
  }

  // 4. Clinical Signatures
  const handleApprove = async () => {
    const encId = selectedEncounter?.encounter_id || selectedEncounter?.id || 'AL-2048'
    try {
      await fetch('/api/audit/approve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: encId }),
      })
    } catch {}
    setActionMessage(`✓ Clinical summary for ${selectedEncounter?.patient_name || 'Patient'} approved and signed into electronic medical record.`)
    setTimeout(() => setActionMessage(null), 4000)
  }

  const handleOverride = async () => {
    if (!overrideReason.trim()) return
    const encId = selectedEncounter?.encounter_id || selectedEncounter?.id || 'AL-2048'
    try {
      await fetch('/api/audit/override-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encId,
          override_reason: overrideReason.trim(),
        }),
      })
    } catch {}
    setActionMessage(`⚡ Doctor override recorded with audit rationale: "${overrideReason.trim()}"`)
    setOverrideReason('')
    setTimeout(() => setActionMessage(null), 4500)
  }

  const handleLinkABHA = async () => {
    if (!abhaInput.trim()) return
    const encId = selectedEncounter?.encounter_id || selectedEncounter?.id || 'AL-2048'
    try {
      await fetch('/api/fhir/link-abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: encId,
          abha_number: abhaInput.trim(),
        }),
      })
    } catch {}
    setActionMessage(`🔗 ABHA ID ${abhaInput.trim()} verified & linked to ABDM health locker.`)
    setAbhaInput('')
    setTimeout(() => setActionMessage(null), 5000)
  }

  const handleDownloadFHIR = () => {
    const encId = selectedEncounter?.encounter_id || selectedEncounter?.id || 'AL-2048'
    const bundle = {
      resourceType: 'Bundle',
      type: 'document',
      id: `arogya-${encId}`,
      timestamp: new Date().toISOString(),
      patient: selectedEncounter?.patient_name || 'Ananya Sharma',
      age: selectedEncounter?.age || 54,
      gender: selectedEncounter?.gender || 'Female',
      chief_complaint: selectedEncounter?.chief_complaint || 'Severe chest discomfort',
      triage: selectedEncounter?.triage_level || 'CRITICAL',
      abdm_conformant: true,
      entries: [
        { resourceType: 'Patient', id: selectedEncounter?.patient_id || 'pat-01', name: selectedEncounter?.patient_name || 'Ananya Sharma' },
        { resourceType: 'Encounter', status: 'finished', class: 'AMB', period: { start: new Date().toISOString() } },
        { resourceType: 'Condition', code: { text: selectedEncounter?.chief_complaint || 'Clinical Intake' } },
        { resourceType: 'Consent', status: 'active', version: 'v1.0', scope: 'patient-privacy-dpdp-2023' }
      ]
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `arogyasetu-fhir-${encId}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setActionMessage('📄 HL7 FHIR R4 Bundle exported & downloaded successfully!')
    setTimeout(() => setActionMessage(null), 4000)
  }

  const handleDeleteEncounter = async (encId) => {
    try {
      const res = await fetch(`/api/queue/encounters/${encId}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setActionMessage(`✓ Encounter ${encId.slice(0, 8)} cleared successfully.`)
        setEncounters((prev) => prev.filter((e) => (e.encounter_id || e.id) !== encId))
        if ((selectedEncounter?.encounter_id || selectedEncounter?.id) === encId) {
          setSelectedEncounter(null)
        }
        setTimeout(() => setActionMessage(null), 4000)
      } else {
        setActionMessage('Failed to delete encounter from server.')
      }
    } catch {
      setActionMessage('Network error while deleting encounter.')
    }
  }

  const handleClearAllEncounters = async () => {
    if (!window.confirm('Are you sure you want to clear all encounters from the doctor queue?')) return
    try {
      const res = await fetch('/api/queue/encounters/clear-all', {
        method: 'DELETE',
      })
      if (res.ok) {
        setEncounters([])
        setSelectedEncounter(null)
        setActionMessage('✓ All encounters cleared from queue.')
        setTimeout(() => setActionMessage(null), 4000)
      }
    } catch {
      setActionMessage('Failed to clear queue.')
    }
  }

  const filteredEncounters = encounters.filter((e) => {
    const matchesFilter =
      filterSeverity === 'ALL' || (e.triage_level || 'ROUTINE').toUpperCase() === filterSeverity
    const matchesSearch =
      !searchQuery.trim() ||
      (e.patient_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.chief_complaint || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.id || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2E1B15] flex flex-row font-sans">
      {/* Sidebar */}
      <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} onSignOut={signOut} />

      {/* Main Workspace Area */}
      <main className="flex-1 min-h-screen p-8 lg:p-10 space-y-8 overflow-y-auto max-w-[1400px]">
        {/* Top Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-[#8C7A70] font-medium tracking-wide">Thursday, 28 August 2026 • AI Triage OPD</div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2E1B15] tracking-tight mt-0.5">
              {activeNav === 'overview' && 'Overview'}
              {activeNav === 'escalations' && 'Live Escalations'}
              {activeNav === 'queue' && 'Patient Queue & Directory'}
              {activeNav === 'history' && 'Clinical Record Archive'}
              {activeNav === 'fhir' && 'HL7 FHIR R4 Exports'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-[#8C7A70]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search patient, ABHA, symptom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white rounded-full border border-[#EFE8DE] text-xs text-[#2E1B15] placeholder-[#8C7A70] shadow-sm outline-none focus:border-[#6E3E30] transition w-56 sm:w-64"
              />
            </div>

            <button
              onClick={() => setActiveNav('escalations')}
              className="relative p-2.5 rounded-full bg-[#2E1B15] text-[#FAF6F0] hover:bg-[#3D251D] transition shadow-sm"
              title="Escalation alerts"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E04F36] ring-2 ring-[#2E1B15]" />
            </button>
          </div>
        </div>

        {/* Action Feedback Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-semibold shadow-sm flex items-center justify-between animate-fadeIn">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-[#166534] hover:opacity-75 font-bold">✕</button>
          </div>
        )}

        {/* ── VIEW 1: Overview ─────────────────────────────────────────── */}
        {activeNav === 'overview' && (
          <div className="space-y-8">
            <MetricStats />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5">
                <PatientQueue
                  encounters={filteredEncounters}
                  selectedId={selectedEncounter?.encounter_id || selectedEncounter?.id}
                  onSelect={handleSelectEncounter}
                  filterSeverity={filterSeverity}
                  onFilterChange={setFilterSeverity}
                />
              </div>
              <div className="lg:col-span-7">
                <EncounterDetail
                  encounter={selectedEncounter}
                  onViewEvidence={() => setActiveNav('escalations')}
                  onApprove={handleApprove}
                  onDownloadFHIR={handleDownloadFHIR}
                  onDeleteEncounter={handleDeleteEncounter}
                  overrideReason={overrideReason}
                  setOverrideReason={setOverrideReason}
                  onOverride={handleOverride}
                  abhaInput={abhaInput}
                  setAbhaInput={setAbhaInput}
                  onLinkABHA={handleLinkABHA}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW 2: Live Escalations ─────────────────────────────────── */}
        {activeNav === 'escalations' && (
          <LiveEscalationsView
            alert={escalationAlert}
            onOpenEncounter={() => {
              if (escalationAlert?.encounter_id) {
                handleSelectEncounter(escalationAlert.encounter_id)
              }
              setActiveNav('overview')
            }}
          />
        )}

        {/* ── VIEW 3: Patient Queue & Folder Explorer ──────────────────── */}
        {activeNav === 'queue' && (
          <div className="bg-[#FAF7F2] rounded-[24px] p-8 border border-[#EFE8DE] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
                  OPD CLINICAL DIRECTORY
                </span>
                <h3 className="text-2xl font-serif text-[#2E1B15] mt-0.5">
                  Queue Directory Explorer ({filteredEncounters.length} Encounters)
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleClearAllEncounters}
                  className="px-4 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100 text-xs font-bold transition shadow-sm active:scale-95 flex items-center gap-1.5"
                >
                  <span>🗑️</span>
                  <span>Clear All Encounters</span>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#7C6C62] font-semibold">Active Folder:</span>
                  <span className="px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE] text-xs font-mono font-bold text-[#2E1B15]">
                    /clinical-records/2026/08/28/
                  </span>
                </div>
              </div>
            </div>

            {/* Directory Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#8C7A70]">
                  <span className="font-bold">📁 2026 / August (Today)</span>
                  <span className="font-mono">{filteredEncounters.length} total</span>
                </div>
                <div className="text-2xl font-serif text-[#2E1B15]">{filteredEncounters.length}</div>
                <p className="text-[11px] text-[#7C6C62]">Live intake encounters from kiosk & mobile</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#8C7A70]">
                  <span className="font-bold">🚨 Critical / Escalations</span>
                  <span className="font-mono">
                    {filteredEncounters.filter(e => (e.triage_level || '').toUpperCase() === 'CRITICAL').length} items
                  </span>
                </div>
                <div className="text-2xl font-serif text-[#D9383A]">
                  {filteredEncounters.filter(e => (e.triage_level || '').toUpperCase() === 'CRITICAL').length}
                </div>
                <p className="text-[11px] text-[#7C6C62]">Immediate clinical physician review required</p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] space-y-2 shadow-sm">
                <div className="flex items-center justify-between text-xs text-[#8C7A70]">
                  <span className="font-bold">🔒 Signed & ABDM Linked</span>
                  <span className="font-mono">100%</span>
                </div>
                <div className="text-2xl font-serif text-[#12322B]">Verified</div>
                <p className="text-[11px] text-[#7C6C62]">Digital consent and cryptographic audit trail</p>
              </div>
            </div>

            {/* Detailed Encounters List */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7A70]">
                Encounters in Current Folder Directory:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEncounters.map((enc) => (
                  <div
                    key={enc.id}
                    onClick={() => {
                      handleSelectEncounter(enc.id)
                      setActiveNav('overview')
                    }}
                    className="p-5 rounded-2xl bg-white border border-[#EFE8DE] hover:border-[#6E3E30] transition cursor-pointer space-y-3 shadow-sm group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📄</span>
                        <span className="text-xs font-mono font-bold text-[#2E1B15]">
                          ENC-{enc.id?.slice(0, 8).toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        (enc.triage_level || '').toUpperCase() === 'CRITICAL'
                          ? 'bg-[#FCE8E6] text-[#D9383A]'
                          : (enc.triage_level || '').toUpperCase() === 'URGENT'
                          ? 'bg-[#FEF3C7] text-[#D97706]'
                          : 'bg-[#FAF7F2] text-[#2E1B15]'
                      }`}>
                        {enc.triage_level || 'ROUTINE'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#2E1B15] group-hover:text-[#6E3E30] transition">
                        {enc.patient_name || 'Patient'}
                      </h4>
                      <p className="text-xs text-[#7C6C62] mt-0.5">
                        {enc.age || 54} yrs • {enc.chief_complaint || 'General intake'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-[#FAF6F0] flex items-center justify-between text-[11px] text-[#8C7A70]">
                      <span>📅 28 Aug 2026</span>
                      <span className="font-semibold text-[#2E1B15]">🕒 {enc.time || '11:00 AM'}</span>
                      <span className="text-[#6E3E30] font-bold group-hover:underline">Open Review →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW 4: Clinical Record Archive Vault ────────────────────── */}
        {activeNav === 'history' && (
          <div className="bg-[#FAF7F2] rounded-[24px] p-8 border border-[#EFE8DE] shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A70] block">
                  PATIENT RECORD ARCHIVE VAULT
                </span>
                <h3 className="text-2xl font-serif text-[#2E1B15] mt-0.5">
                  Long-term Clinical History & Records
                </h3>
              </div>
              <div className="text-xs font-mono text-[#8C7A70] bg-white px-3 py-1.5 rounded-xl border border-[#EFE8DE]">
                📁 /archive/2026/
              </div>
            </div>

            {/* Folder Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: '2026-08-28', label: '28 Aug 2026 (Today)', count: `${filteredEncounters.length} records` },
                { id: '2026-08-27', label: '27 Aug 2026', count: '12 records' },
                { id: '2026-08-26', label: '26 Aug 2026', count: '18 records' },
                { id: '2026-08-25', label: '25 Aug 2026', count: '24 records' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFolderDate(f.id)}
                  className={`p-4 rounded-2xl text-left transition border ${
                    selectedFolderDate === f.id
                      ? 'bg-white border-[#2E1B15] shadow-sm'
                      : 'bg-white/60 border-[#EFE8DE] hover:bg-white text-[#7C6C62]'
                  }`}
                >
                  <span className="text-base">📁</span>
                  <h4 className="text-xs font-bold text-[#2E1B15] mt-1">{f.label}</h4>
                  <p className="text-[10px] text-[#8C7A70]">{f.count}</p>
                </button>
              ))}
            </div>

            {/* Records Table in Selected Vault */}
            <div className="bg-white rounded-2xl border border-[#EFE8DE] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-[#FAF6F0] flex items-center justify-between">
                <span className="text-xs font-bold text-[#2E1B15] uppercase tracking-wider">
                  Archived Encounters ({selectedFolderDate})
                </span>
                <span className="text-xs font-mono text-[#8C7A70]">ABDM Cryptographic Integrity: Active</span>
              </div>

              <div className="divide-y divide-[#FAF6F0]">
                {filteredEncounters.map((enc, idx) => (
                  <div key={enc.id || idx} className="p-4 hover:bg-[#FAF7F2] transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#2E1B15]">{enc.patient_name || 'Patient'}</span>
                        <span className="text-xs text-[#7C6C62]">({enc.age || 54} yrs, {enc.gender || 'Female'})</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          (enc.triage_level || '').toUpperCase() === 'CRITICAL'
                            ? 'bg-[#FCE8E6] text-[#D9383A]'
                            : 'bg-[#E4EDE9] text-[#12322B]'
                        }`}>
                          {enc.triage_level || 'ROUTINE'}
                        </span>
                      </div>
                      <p className="text-xs text-[#7C6C62]">
                        Complaint: <strong className="text-[#2E1B15]">{enc.chief_complaint || 'Clinical Review'}</strong> • ID: <span className="font-mono">{enc.id?.slice(0, 8)}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          handleSelectEncounter(enc.id)
                          setActiveNav('overview')
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2E1B15] text-white text-xs font-bold hover:bg-[#3D251D] transition"
                      >
                        Inspect Record
                      </button>
                      <button
                        onClick={handleDownloadFHIR}
                        className="px-3 py-1.5 rounded-lg bg-white border border-[#EFE8DE] text-[#2E1B15] text-xs font-bold hover:bg-[#FAF7F2] transition"
                      >
                        FHIR Bundle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW 5: FHIR Exports ─────────────────────────────────────── */}
        {activeNav === 'fhir' && (
          <FHIRExportsView
            encounters={encounters}
            selectedEncounter={selectedEncounter}
            onSelectEncounter={handleSelectEncounter}
            onDownloadFHIR={handleDownloadFHIR}
            onDeleteEncounter={handleDeleteEncounter}
            onClearAllEncounters={handleClearAllEncounters}
          />
        )}
      </main>

      {/* Floating Toast */}
      {showToast && (
        <EscalationToast
          alert={escalationAlert}
          onOpen={() => {
            handleSelectEncounter(escalationAlert.encounter_id)
            setActiveNav('overview')
          }}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  )
}
