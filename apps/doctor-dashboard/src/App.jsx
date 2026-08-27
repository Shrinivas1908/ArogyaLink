import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedLayout from './components/ProtectedLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

/**
 * Doctor Dashboard — Root App
 * Light White & Sky Blue Theme matching Main Portal.
 */
export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
