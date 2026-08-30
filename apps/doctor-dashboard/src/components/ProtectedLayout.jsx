import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — ProtectedLayout
 * Strictly blocks access and redirects to /login if doctor is not authenticated.
 */
export default function ProtectedLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#6E3E30] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-bold text-[#6E3E30]">Verifying Clinical Session...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans">
      <Outlet />
    </div>
  )
}
