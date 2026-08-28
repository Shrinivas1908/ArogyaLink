import React from 'react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="ArogyaLink Logo"
            className="h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-sky-700">
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
