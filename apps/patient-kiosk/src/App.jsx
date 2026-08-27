import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'

/**
 * Patient Kiosk — Root App
 * React Router v6 routes. Auth not required for the kiosk (no staff login).
 * Additional routes (session, consent, intake, etc.) added from Phase 3+.
 */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
      </Route>
    </Routes>
  )
}
