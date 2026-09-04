import React, { useState, useEffect } from 'react'

export default function Header({ activeView = 'portal', setActiveView }) {
  const [health, setHealth] = useState({ status: 'checking', db: 'checking' })

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', db: 'error' }))
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#E4EDE9] px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div
          onClick={() => {
            if (setActiveView) setActiveView('portal')
            window.location.hash = ''
          }}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#12322B] text-white flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
          <div>
            <span className="text-xs font-extrabold tracking-widest text-[#12322B] uppercase">
              AROGYA <span className="font-light text-[#5F7D74]">SETU</span>
            </span>
          </div>
        </div>

        {/* Section Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-[#5F7D74]">
          <button
            onClick={() => {
              if (setActiveView) setActiveView('portal')
              window.location.hash = '#features'
            }}
            className={`hover:text-[#12322B] transition ${activeView === 'portal' ? 'text-[#12322B] font-bold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => {
              if (setActiveView) setActiveView('kiosk')
              window.location.hash = '#kiosk'
            }}
            className={`hover:text-[#12322B] transition ${activeView === 'kiosk' ? 'text-[#12322B] font-bold underline' : ''}`}
          >
            Patient Kiosk
          </button>
          <button
            onClick={() => {
              if (setActiveView) setActiveView('doctor')
              window.location.hash = '#doctor'
            }}
            className={`hover:text-[#12322B] transition ${activeView === 'doctor' ? 'text-[#12322B] font-bold underline' : ''}`}
          >
            Doctor Queue
          </button>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex items-center gap-2 text-xs font-bold">
          {activeView !== 'portal' && (
            <button
              onClick={() => {
                if (setActiveView) setActiveView('portal')
                window.location.hash = ''
              }}
              className="px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition shadow-sm"
            >
              🌐 Main Portal
            </button>
          )}

          <button
            onClick={() => {
              if (setActiveView) setActiveView('kiosk')
              window.location.hash = '#kiosk'
            }}
            className={`px-4 py-2 rounded-full border transition shadow-sm ${
              activeView === 'kiosk'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white border-[#E4EDE9] text-[#12322B] hover:bg-[#FAF7F2]'
            }`}
          >
            📲 Patient Kiosk
          </button>

          <button
            onClick={() => {
              if (setActiveView) setActiveView('doctor')
              window.location.hash = '#doctor'
            }}
            className={`px-4 py-2 rounded-full transition shadow-sm ${
              activeView === 'doctor'
                ? 'bg-emerald-700 text-white'
                : 'bg-[#12322B] text-white hover:bg-[#1C453C]'
            }`}
          >
            🩺 Doctor Workspace →
          </button>
        </div>
      </div>
    </header>
  )
}
