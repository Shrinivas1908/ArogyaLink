import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/Layout'
import ProtectedLayout from './components/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * Doctor Dashboard — Root App
 * Wraps routes inside AuthProvider.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Layout />}>
          <Route path="login" element={<Login />} />
        </Route>

        {/* Protected routes */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
