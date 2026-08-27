import { useState, useEffect } from 'react'

/**
 * Doctor Dashboard — Main Dashboard Page (Phase 0 placeholder)
 * Shows backend health and a placeholder queue panel.
 * Full patient queue, review, and escalation UI built in Phases 6–7.
 */
export default function Dashboard() {
  const [health, setHealth] = useState(null)

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', db: 'error', version: '—' }))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-indigo-900 mb-6">Doctor Dashboard</h1>

      {/* Backend health card */}
      <div className="bg-white rounded-xl shadow p-6 mb-6 flex items-center gap-4">
        <div className={`w-3 h-3 rounded-full ${health?.status === 'ok' ? 'bg-green-500' : 'bg-red-500'}`} />
        <div>
          <p className="font-semibold text-slate-700">Backend Status</p>
          <p className="text-sm text-slate-400">
            {health
              ? `API: ${health.status} · DB: ${health.db} · v${health.version}`
              : 'Checking…'}
          </p>
        </div>
      </div>

      {/* Patient queue placeholder */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Patient Queue</h2>
        <p className="text-slate-400 text-sm">
          Patient queue and review workflow implemented in Phase 6.
        </p>
      </div>
    </div>
  )
}
