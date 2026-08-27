import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — Main Dashboard Page
 * Displays staff role, backend health, patient queue, and admin controls if role === 'admin'.
 */
export default function Dashboard() {
  const [health, setHealth] = useState(null)
  const { user, role, userProfile } = useAuth()

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', db: 'error', version: '—' }))
  }, [])

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-indigo-900">Doctor Dashboard</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        {role && (
          <span
            className={`px-3 py-1 text-xs font-semibold rounded-full uppercase tracking-wider ${
              role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}
          >
            {role}
          </span>
        )}
      </div>

      {/* Backend health card */}
      <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
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

      {/* Admin Panel (Shown conditionally if user is an admin) */}
      {role === 'admin' && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">Admin Management Panel</h2>
          <p className="text-sm text-purple-700 mb-4">
            You have full administrative privileges to manage staff accounts and system parameters.
          </p>
          <button className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm font-medium hover:bg-purple-800 transition">
            Manage Staff Profiles
          </button>
        </div>
      )}

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
