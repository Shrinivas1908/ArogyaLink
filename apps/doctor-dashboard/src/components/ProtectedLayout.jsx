import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — ProtectedLayout
 * Renders Doctor Portal with seamless routing and warm espresso/cream styling.
 */
export default function ProtectedLayout() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6E3E30] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans">
      <Outlet />
    </div>
  )
}
