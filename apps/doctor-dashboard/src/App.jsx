import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedLayout from './components/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * Doctor Dashboard — Root App
 * Login is public, while Dashboard is strictly protected behind Doctor Authentication.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
        <Route path="*" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
