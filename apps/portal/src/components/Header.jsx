import React, { useState, useEffect } from 'react'

export default function Header() {
  const [health, setHealth] = useState({ status: 'checking', db: 'checking' })

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', db: 'error' }))
  }, [])

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <svg
              className="w-6 h-6 text-white shrink-0"
              width="24"
              height="24"
              style={{ width: '24px', height: '24px', maxWidth: '24px', maxHeight: '24px' }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-sky-900 to-sky-600 bg-clip-text text-transparent">
              ArogyaLink
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-sky-600">
              Doctor · Patient Health Bridge
            </span>
          </div>
        </a>

        {/* Backend Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${health.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>Backend: {health.status === 'ok' ? 'Online' : health.status}</span>
        </div>

        {/* Portal Switching Links */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 transition shadow-sm"
          >
            Patient Kiosk (5173)
          </a>
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/25 hover:bg-sky-600 transition"
          >
            Doctor Portal (5174)
          </a>
        </div>
      </div>
    </header>
  )
}
