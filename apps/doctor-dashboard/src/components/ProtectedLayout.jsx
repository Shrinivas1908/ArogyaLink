import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — ProtectedLayout
 * Wraps dashboard routes. Verifies active Supabase session.
 * Unauthenticated users are redirected to /login.
 */
export default function ProtectedLayout() {
  const { session, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-700"></div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-indigo-800 text-white px-6 py-4 shadow flex justify-between items-center">
        <span className="text-xl font-bold tracking-tight">🏥 Arogya Link — Staff Portal</span>
        <div className="flex items-center gap-4">
          <span className="text-sm opacity-90">{session.user.email}</span>
          <button
            onClick={signOut}
            className="bg-indigo-700 hover:bg-indigo-600 text-xs px-3 py-1.5 rounded transition-colors font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
