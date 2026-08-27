import { useState, useEffect } from 'react'

/**
 * Patient Kiosk — Home Page (Phase 0 placeholder)
 * Shows a language selector and "Start Session" button.
 * Also pings /health to verify backend connectivity.
 *
 * Full session/consent flow implemented in Phase 3.
 */
export default function Home() {
  const [backendStatus, setBackendStatus] = useState('checking')

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setBackendStatus(data.status === 'ok' ? 'connected' : 'degraded'))
      .catch(() => setBackendStatus('offline'))
  }, [])

  const statusColor = {
    checking: 'bg-yellow-100 text-yellow-800',
    connected: 'bg-green-100 text-green-800',
    degraded: 'bg-orange-100 text-orange-800',
    offline: 'bg-red-100 text-red-800',
  }[backendStatus]

  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-12 gap-8">

      {/* Backend health indicator */}
      <div className={`text-xs font-medium px-3 py-1 rounded-full ${statusColor}`}>
        Backend: {backendStatus}
      </div>

      {/* Heading */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Welcome to Arogya Link</h1>
        <p className="text-slate-500 text-lg">Patient Health Kiosk · SIH 2026</p>
      </div>

      {/* Language selector (placeholder — multilingual added in Phase 9) */}
      <div className="flex gap-3 flex-wrap justify-center">
        {['English', 'हिंदी', 'বাংলা', 'தமிழ்', 'తెలుగు'].map((lang) => (
          <button
            key={lang}
            className="px-5 py-3 rounded-xl border-2 border-blue-200 bg-white text-slate-700 text-lg font-medium hover:border-blue-500 hover:bg-blue-50 transition-colors min-w-[110px]"
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Start button — Phase 3 wires this to POST /session */}
      <button
        id="btn-start-session"
        className="mt-4 bg-blue-700 hover:bg-blue-800 text-white text-xl font-semibold px-10 py-5 rounded-2xl shadow-lg transition-colors"
        onClick={() => alert('Session flow implemented in Phase 3')}
      >
        Start Session →
      </button>

      <p className="text-slate-400 text-sm text-center max-w-xs">
        Your information is kept private and only shared with your care team.
      </p>
    </div>
  )
}
