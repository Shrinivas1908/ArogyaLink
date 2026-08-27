import { useState, useEffect } from 'react'

export default function Header() {
  const [health, setHealth] = useState({ status: 'checking', db: 'checking' })

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', db: 'error' }))
  }, [])

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
              ArogyaLink
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-teal-400">
              Doctor · Patient Health Bridge
            </span>
          </div>
        </a>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#features" className="hover:text-teal-400 transition-colors">Platform Features</a>
          <a href="#teleconsult" className="hover:text-teal-400 transition-colors">Tele-Consultation</a>
          <a href="#triage" className="hover:text-teal-400 transition-colors">Emergency Triage</a>
          <a href="#digital-health" className="hover:text-teal-400 transition-colors">ABHA Health Card</a>
        </nav>

        {/* Action Buttons & Status */}
        <div className="flex items-center gap-4">
          {/* Live System Status */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs">
            <span className={`w-2 h-2 rounded-full ${health.status === 'ok' ? 'bg-teal-400 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-slate-400">Backend API:</span>
            <span className={`font-semibold ${health.status === 'ok' ? 'text-teal-400' : 'text-red-400'}`}>
              {health.status === 'ok' ? 'Online' : 'Offline'}
            </span>
          </div>

          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="hidden lg:inline-flex px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 transition"
          >
            Patient Kiosk (5173)
          </a>

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-teal-500 to-indigo-600 text-white shadow-lg shadow-teal-500/20 hover:opacity-95 transition"
          >
            Doctor Portal (5174)
          </a>
        </div>
      </div>
    </header>
  )
}
