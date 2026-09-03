import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-sky-100 px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <img
            src="/logo.jpg"
            alt="ArogyaSetu Logo"
            className="h-12 w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform"
          />
          <div>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-sky-700">
              Clinical Review Dashboard
            </span>
          </div>
        </div>

        {/* Doctor Profile & Action Buttons */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:5175"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 transition shadow-sm"
          >
            Main Portal (5175)
          </a>
          <a
            href="http://localhost:5173"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-bold px-3.5 py-2 rounded-xl bg-white text-sky-800 border border-sky-200 hover:bg-sky-50 transition shadow-sm"
          >
            Kiosk (5173)
          </a>

          {user ? (
            <div className="flex items-center gap-3 pl-2 border-l border-sky-200">
              <div className="text-right">
                <span className="block text-xs font-bold text-slate-800">
                  {user.user_metadata?.full_name || 'Dr. Reviewer'}
                </span>
                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-sky-100 text-sky-800 border border-sky-200">
                  Doctor
                </span>
              </div>
              <button
                onClick={signOut}
                className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-sky-100 transition text-xs font-semibold"
                title="Sign out"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <a
              href="/login"
              className="text-xs font-bold px-4 py-2 rounded-xl bg-sky-500 text-white shadow-md shadow-sky-500/20 hover:bg-sky-600 transition"
            >
              Sign In
            </a>
          )}
        </div>
      </div>
    </header>
  )
}
