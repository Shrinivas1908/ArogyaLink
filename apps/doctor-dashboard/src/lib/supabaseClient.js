import { createClient } from '@supabase/supabase-js'

// Supabase Client initialization using Vite environment variables or defaults
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  'https://oinwykpymyanmzsxppgs.supabase.co'

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pbnd5a3B5bXlhbm16c3hwcGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc4NDk3OTEsImV4cCI6MjEwMzQyNTc5MX0.8_iFh2DJSoVpa75YQzZ5O8rcH2a26zEni6QxefvisQ4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
