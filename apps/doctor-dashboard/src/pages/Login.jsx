import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../context/AuthContext'

/**
 * Doctor Dashboard — Login Page
 * Connects inputs to supabase.auth.signInWithPassword.
 * Redirects directly to dashboard if already authenticated.
 */
export default function Login() {
  const { session } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setLoading(false)
    }
  }

  return (
    <div className="relative py-12 px-6 flex items-center justify-center min-h-[calc(100vh-100px)] overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-sky-200/50 blur-[100px] rounded-full pointer-events-none" />

      <div className="glass-card rounded-3xl p-8 sm:p-10 w-full max-w-md space-y-6 relative z-10 border border-sky-200 shadow-xl">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-400 to-sky-600 flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Clinical Staff Sign In</h1>
          <p className="text-slate-500 text-xs font-semibold">ArogyaLink · Doctor & Reviewer Portal</p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-700 text-xs p-3.5 rounded-xl border border-red-200 font-semibold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="input-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@arogyalink.in"
                className="w-full px-4 py-3 border border-sky-200 rounded-xl text-sm font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Password
              </label>
              <input
                id="input-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-sky-200 rounded-xl text-sm font-medium text-slate-800 bg-white outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
              />
            </div>
          </div>

          <button
            id="btn-sign-in"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 disabled:opacity-50 text-white font-bold text-sm shadow-md shadow-sky-500/25 transition"
          >
            {loading ? 'Authenticating…' : 'Sign In to Workspace →'}
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-slate-400 font-medium border-t border-sky-100">
          Authorized hospital & clinic personnel only.
        </div>
      </div>
    </div>
  )
}
