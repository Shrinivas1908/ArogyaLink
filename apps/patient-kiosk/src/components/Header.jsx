import React from 'react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
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
              Patient Intake Kiosk
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <a
            href="http://localhost:5175"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 transition shadow-sm"
          >
            Main Portal (5175)
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
