import { Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Header from './Header'

/**
 * Doctor Dashboard — ProtectedLayout
 * Renders Doctor Portal with Header & seamless access for doctors.
 */
export default function ProtectedLayout() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-sky-50/50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-sky-50/50 flex flex-col font-sans">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}
