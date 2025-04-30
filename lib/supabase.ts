import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Use environment variables for credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create the Supabase client only if credentials are available
let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey)
} else {
  console.warn("Supabase environment variables are missing. Using mock data instead.")
}

export { supabase }

// Server-side client with higher privileges
export const createClient = () => supabase
