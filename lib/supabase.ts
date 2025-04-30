import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Export the singleton instance
export const supabase = supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey)

// Export a function that returns the singleton instance for server-side usage
export const createClient = () => {
  return supabase
}

// Export a function that returns a server-side client with service role key
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  return supabaseCreateClient<Database>(supabaseUrl, supabaseServiceKey)
}
