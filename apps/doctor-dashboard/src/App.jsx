import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedLayout from './components/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * Doctor Dashboard — Root App
 * React Router v6 route tree.
 * ProtectedLayout stub is here — auth logic wired in Phase 1 (Supabase Auth).
 */
export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Layout />}>
        <Route path="login" element={<Login />} />
      </Route>

      {/* Protected routes — auth check added in Phase 1 */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route index element={<Dashboard />} />
      </Route>
    </Routes>
  )
}
