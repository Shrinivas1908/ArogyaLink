import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext({
  session: null,
  user: null,
  role: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (currentSession) => {
    if (!currentSession) {
      setRole(null)
      setUserProfile(null)
      return
    }
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiBase}/staff/me`, {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      })
      if (res.ok) {
        const profileData = await res.json()
        setRole(profileData.role)
        setUserProfile(profileData)
      } else {
        setRole(null)
        setUserProfile(null)
      }
    } catch {
      setRole(null)
      setUserProfile(null)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        fetchProfile(session).finally(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session) {
        fetchProfile(session).finally(() => setLoading(false))
      } else {
        setRole(null)
        setUserProfile(null)
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    setSession(null)
    setUser(null)
    setRole(null)
    setUserProfile(null)
    setLoading(false)
  }

  return (
    <AuthContext.Provider value={{ session, user, role, userProfile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
