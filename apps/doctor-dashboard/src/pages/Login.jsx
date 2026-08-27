/**
 * Doctor Dashboard — Login Page (Phase 0 placeholder)
 * Full Supabase Auth sign-in implemented in Phase 1.
 */
export default function Login() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-2xl shadow-lg p-10 w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-800">Staff Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Arogya Link · Doctor / Admin Portal</p>
        </div>

        <div className="flex flex-col gap-3">
          <input
            id="input-email"
            type="email"
            placeholder="Email address"
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            id="input-password"
            type="password"
            placeholder="Password"
            className="border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <button
          id="btn-sign-in"
          className="bg-indigo-700 hover:bg-indigo-800 text-white font-semibold py-3 rounded-lg transition-colors"
          onClick={() => alert('Supabase Auth sign-in implemented in Phase 1')}
        >
          Sign In
        </button>

        <p className="text-center text-xs text-gray-400">
          Staff accounts are provisioned by the administrator.
        </p>
      </div>
    </div>
  )
}
