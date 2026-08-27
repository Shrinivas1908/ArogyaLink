import { Outlet, Navigate } from 'react-router-dom'

/**
 * Doctor Dashboard — ProtectedLayout (stub)
 * Phase 0: passes through to children (no auth check yet).
 * Phase 1: replace the pass-through with Supabase session check.
 *
 * Per Phase 0 plan:
 *   "stub a shared Layout and a placeholder ProtectedLayout in the dashboard
 *    (auth logic added in Phase 1)"
 */
export default function ProtectedLayout() {
  // Phase 1: replace this with: const { session } = useAuth()
  // if (!session) return <Navigate to="/login" replace />
  const isAuthenticated = true // stub — always passes in Phase 0

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
