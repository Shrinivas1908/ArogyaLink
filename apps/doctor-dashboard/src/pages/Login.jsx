import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — Login Page
 * Doctor & Clinical Reviewer Sign-In with credentials validation.
 */
export default function Login() {
  const { session, signInWithCredentials } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('doctor@arogyalink.in')
  const [password, setPassword] = useState('Doctor@2026')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState(null)

  // Redirect to dashboard index if already authenticated
  if (session) {
    return <Navigate to="/" replace />
  }

  const handleSignIn = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    try {
      await signInWithCredentials(email, password)
      navigate('/', { replace: true })
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="relative py-12 px-6 flex items-center justify-center min-h-screen bg-[#FAF6F0] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#EFE8DE]/60 blur-[100px] rounded-full pointer-events-none" />

      <div className="bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md space-y-6 relative z-10 border border-[#EFE8DE] shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#6E3E30] text-white mx-auto flex items-center justify-center text-2xl font-serif font-bold shadow-md shadow-[#6E3E30]/20">
            🩺
          </div>
          <h1 className="text-2xl font-serif font-bold tracking-tight text-[#2E1B15]">
            Doctor & Reviewer Portal
          </h1>
          <p className="text-[#7C6C62] text-xs font-semibold">
            ArogyaSetu · Clinical Decision Workspace
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#523F38] mb-1">
                Doctor ID / Email
              </label>
              <input
                id="input-email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@arogyalink.in"
                className="w-full px-4 py-3 border border-[#EFE8DE] rounded-xl text-xs font-bold text-[#2E1B15] bg-[#FAF7F2] outline-none focus:border-[#6E3E30] focus:bg-white shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#523F38] mb-1">
                Password / Security PIN
              </label>
              <input
                id="input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-[#EFE8DE] rounded-xl text-xs font-bold text-[#2E1B15] bg-[#FAF7F2] outline-none focus:border-[#6E3E30] focus:bg-white shadow-sm"
              />
            </div>
          </div>

          <button
            id="btn-sign-in"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-[#2E1B15] hover:bg-[#3D251D] disabled:opacity-50 text-[#FAF6F0] font-bold text-xs shadow-md transition active:scale-95"
          >
            {loading ? 'Authenticating Clinical Credentials…' : 'Sign In as Doctor →'}
          </button>
        </form>

        <div className="pt-3 text-center text-xs text-[#8C7A70] font-medium border-t border-[#EFE8DE] space-y-1">
          <p>🔒 Strictly authorized medical officers & reviewers only.</p>
          <p className="text-[11px] text-[#7C6C62]">All clinical actions are audit-logged under NMC guidelines.</p>
        </div>
      </div>
    </div>
  )
}
