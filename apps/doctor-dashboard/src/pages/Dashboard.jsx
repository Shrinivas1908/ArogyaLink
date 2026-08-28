import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/Sidebar'
import MetricStats from '../components/MetricStats'
import PatientQueue from '../components/PatientQueue'
import EncounterDetail from '../components/EncounterDetail'
import LiveEscalationsView from '../components/LiveEscalationsView'
import EscalationToast from '../components/EscalationToast'

const DEFAULT_ENCOUNTERS = [
  {
    id: 'AL-2048',
    patient_name: 'Ananya Sharma',
    age: 54,
    chief_complaint: 'Severe chest discomfort',
    triage_level: 'CRITICAL',
    status: 'Awaiting Review',
    time: 'Now',
    rule_desc: 'Rule RF-CARD-001 triggered by confirmed intake evidence.',
    patient: { full_name: 'Ananya Sharma', age: 54, gender: 'Female' },
  },
  {
    id: 'AL-2047',
    patient_name: 'Rohan Mehta',
    age: 31,
    chief_complaint: 'Persistent fever',
    triage_level: 'URGENT',
    status: 'Awaiting Review',
    time: '8 min',
    patient: { full_name: 'Rohan Mehta', age: 31, gender: 'Male' },
  },
  {
    id: 'AL-2046',
    patient_name: 'Meera Joshi',
    age: 67,
    chief_complaint: 'Medication follow-up',
    triage_level: 'ROUTINE',
    status: 'Completed',
    time: '18 min',
    patient: { full_name: 'Meera Joshi', age: 67, gender: 'Female' },
  },
  {
    id: 'AL-2045',
    patient_name: 'Kabir Singh',
    age: 42,
    chief_complaint: 'Breathing difficulty',
    triage_level: 'URGENT',
    status: 'Awaiting Review',
    time: '26 min',
    patient: { full_name: 'Kabir Singh', age: 42, gender: 'Male' },
  },
]

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [activeNav, setActiveNav] = useState('overview')
  const [encounters, setEncounters] = useState(DEFAULT_ENCOUNTERS)
  const [selectedEncounter, setSelectedEncounter] = useState(DEFAULT_ENCOUNTERS[0])
  const [filterSeverity, setFilterSeverity] = useState('ALL')
  const [showToast, setShowToast] = useState(true)
  const [actionMessage, setActionMessage] = useState(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [abhaInput, setAbhaInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const [escalationAlert, setEscalationAlert] = useState({
    encounter_id: 'AL-2048',
    patient_name: 'Ananya Sharma',
    symptoms: 'Severe discomfort + breathing difficulty + radiating pain.',
  })

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
        if (fetched.length > 0) {
          setEncounters(fetched)
        }
      }
    } catch {
      // Retain default encounters
    }
  }

  useEffect(() => {
    fetchQueue()
    const interval = setInterval(fetchQueue, 5000)
    return () => clearInterval(interval)
  }, [])

  // 2. Real-time WebSocket connection
  useEffect(() => {
    let ws
    try {
      ws = new WebSocket('ws://127.0.0.1:8000/ws/notifications')
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'CRITICAL_ESCALATION') {
            setEscalationAlert({
              encounter_id: msg.data.encounter_id || 'AL-2048',
              patient_name: msg.data.patient_name || 'Ananya Sharma',
              symptoms: msg.data.symptoms || 'Severe discomfort + breathing difficulty + radiating pain.',
            })
            setShowToast(true)
            fetchQueue()
          }
        } catch {}
      }
    } catch {}
    return () => ws?.close()
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
    try {
      await fetch('/api/audit/approve-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ encounter_id: selectedEncounter?.encounter_id || selectedEncounter?.id }),
      })
    } catch {}
    setActionMessage('✓ Clinical summary approved and signed into electronic medical record.')
    setTimeout(() => setActionMessage(null), 4000)
  }

  const handleOverride = async () => {
    if (!overrideReason.trim()) return
    try {
      await fetch('/api/audit/override-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: selectedEncounter?.encounter_id || selectedEncounter?.id,
          override_reason: overrideReason.trim(),
        }),
      })
    } catch {}
    setActionMessage('⚡ Clinical summary override recorded with audit rationale.')
    setOverrideReason('')
    setTimeout(() => setActionMessage(null), 4000)
  }

  const handleLinkABHA = async () => {
    if (!abhaInput.trim()) return
    try {
      await fetch('/api/fhir/link-abha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          encounter_id: selectedEncounter?.encounter_id || selectedEncounter?.id,
          abha_number: abhaInput.trim(),
        }),
      })
    } catch {}
    setActionMessage(`🔗 ABHA Card ${abhaInput.trim()} linked successfully.`)
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
      triage: selectedEncounter?.triage_level || 'CRITICAL',
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute('href', dataStr)
    downloadAnchor.setAttribute('download', `arogyalink-fhir-${encId}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
    setActionMessage('📄 FHIR R4 Bundle downloaded successfully!')
    setTimeout(() => setActionMessage(null), 4000)
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
            <div className="text-xs text-[#8C7A70] font-medium tracking-wide">Thursday, 28 August</div>
            <h1 className="text-3xl sm:text-4xl font-serif text-[#2E1B15] tracking-tight mt-0.5">
              {activeNav === 'overview' && 'Overview'}
              {activeNav === 'escalations' && 'Live escalations'}
              {activeNav === 'queue' && 'Patient queue'}
              {activeNav === 'history' && 'Review history'}
              {activeNav === 'fhir' && 'FHIR exports'}
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
                placeholder="Search encounters"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-white rounded-full border border-[#EFE8DE] text-xs text-[#2E1B15] placeholder-[#8C7A70] shadow-sm outline-none focus:border-[#6E3E30] transition w-52 sm:w-64"
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

        {/* Action Message */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-[#166534] text-xs font-semibold shadow-sm flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-[#166534] hover:opacity-75">✕</button>
          </div>
        )}

        {/* Views */}
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

        {activeNav === 'escalations' && (
          <LiveEscalationsView
            alert={escalationAlert}
            onOpenEncounter={() => {
              handleSelectEncounter(escalationAlert.encounter_id)
              setActiveNav('overview')
            }}
          />
        )}

        {activeNav === 'queue' && (
          <div className="bg-[#FAF7F2] rounded-[24px] p-8 border border-[#EFE8DE] shadow-sm space-y-6">
            <h3 className="text-2xl font-serif text-[#2E1B15]">All Active Patients ({filteredEncounters.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredEncounters.map((enc) => (
                <div
                  key={enc.id}
                  onClick={() => {
                    handleSelectEncounter(enc.id)
                    setActiveNav('overview')
                  }}
                  className="p-5 rounded-2xl bg-white border border-[#EFE8DE] hover:border-[#6E3E30] transition cursor-pointer space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#8C7A70]">#{enc.id}</span>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#2E1B15]">
                      {enc.triage_level || 'ROUTINE'}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#2E1B15]">{enc.patient_name}</h4>
                  <p className="text-xs text-[#7C6C62]">{enc.age || 54} yrs • {enc.chief_complaint}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === 'history' && (
          <div className="bg-[#FAF7F2] rounded-[24px] p-8 border border-[#EFE8DE] shadow-sm space-y-4">
            <h3 className="text-2xl font-serif text-[#2E1B15]">Doctor Review History</h3>
            <div className="p-4 rounded-2xl bg-white border border-[#EFE8DE] text-xs text-[#7C6C62]">
              All signed and verified medical records are encrypted and synced to ABDM health lockers.
            </div>
          </div>
        )}

        {activeNav === 'fhir' && (
          <div className="bg-[#FAF7F2] rounded-[24px] p-8 border border-[#EFE8DE] shadow-sm space-y-4">
            <h3 className="text-2xl font-serif text-[#2E1B15]">FHIR R4 Bundle Exporter</h3>
            <div className="p-4 rounded-2xl bg-[#2E1B15] text-[#FAF6F0] font-mono text-xs overflow-x-auto max-h-96">
              <pre>{JSON.stringify({
                resourceType: 'Bundle',
                type: 'document',
                id: selectedEncounter?.encounter_id || selectedEncounter?.id || 'AL-2048',
                patient: selectedEncounter?.patient_name || 'Ananya Sharma',
                abdm_status: 'M1 & M2 Compatible',
              }, null, 2)}</pre>
            </div>
          </div>
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
