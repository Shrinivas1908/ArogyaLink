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
        <a href="#" className="flex items-center gap-2 group">
          <img
            src="/logo.jpg"
            alt="ArogyaLink Logo"
            className="h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
          />
          <div className="hidden sm:block">
            <span className="block text-[10px] uppercase font-bold tracking-widest text-teal-700">
              Doctor · Patient Health Bridge
            </span>
          </div>
        </a>

        {/* Backend Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-900 shadow-sm">
          <span className={`w-2 h-2 rounded-full ${health.status === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span>Backend: {health.status === 'ok' ? 'Online' : health.status}</span>
        </div>

        {/* Section Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
          <a href="#features" className="hover:text-sky-600 transition">Interactive Workspaces</a>
          <a href="#teleconsult" className="hover:text-sky-600 transition">Tele-Consultation</a>
          <a href="#triage" className="hover:text-sky-600 transition">Red-Flag Engine</a>
          <a href="#digital-health" className="hover:text-sky-600 transition">ABDM Health Pass</a>
        </div>

        {/* Portal Links */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <a
            href="#features"
            className="px-4 py-2 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/25 hover:bg-sky-600 transition"
          >
            Launch Workspaces →
          </a>
        </div>
      </div>
    </header>
  )
}
