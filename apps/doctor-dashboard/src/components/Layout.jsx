import { Outlet } from 'react-router-dom'

/**
 * Doctor Dashboard — Shared Layout
 * Wraps all dashboard pages including protected ones.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-800 text-white px-6 py-4 shadow">
        <span className="text-xl font-bold tracking-tight">🏥 Arogya Link — Staff Portal</span>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
