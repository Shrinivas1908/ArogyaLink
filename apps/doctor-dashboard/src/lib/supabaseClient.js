import { createClient } from '@supabase/supabase-js'

// Supabase Client initialization using Vite environment variables.
// These variables are loaded from apps/doctor-dashboard/.env.local.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
