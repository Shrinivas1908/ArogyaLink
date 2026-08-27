import { Outlet } from 'react-router-dom'

/**
 * Patient Kiosk — Shared Layout
 * Wraps all kiosk pages. Offline banner and status indicators added in Phase 13.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-sky-50/50 text-slate-800 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <footer className="border-t border-sky-200/60 bg-white/80 backdrop-blur-md py-4 text-center text-xs text-slate-500 font-medium">
        ArogyaLink Patient Kiosk · SIH 2026 Innovation
      </footer>
    </div>
  )
}

