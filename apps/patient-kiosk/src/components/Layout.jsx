import { Outlet } from 'react-router-dom'

/**
 * Patient Kiosk — Shared Layout
 * Wraps all kiosk pages. Offline banner and status indicators added in Phase 13.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-blue-700 text-white px-6 py-4 flex items-center gap-3 shadow">
        <span className="text-2xl font-bold tracking-tight">🩺 Arogya Link</span>
        <span className="text-sm bg-blue-600 px-2 py-0.5 rounded">Patient Kiosk</span>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="text-center text-xs text-slate-400 py-3">
        Arogya Link · SIH 2026
      </footer>
    </div>
  )
}
