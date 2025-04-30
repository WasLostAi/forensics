import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client - MISSING EXPORT
export const supabase = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Create a client function for server-side usage
export function createClient() {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  // Return existing instance if available
  return supabase
}

// Create a server-side client with service role for admin operations
export async function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase server environment variables")
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  })
}

// Helper function to safely handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (!error) return "Unknown error"

  // Log the error for debugging but return a sanitized message to the user
  console.error("Supabase error:", error)

  if (error.code === "PGRST116") {
    return "Resource not found"
  }

  if (error.code === "23505") {
    return "This record already exists"
  }

  if (error.code === "42P01") {
    return "Database table not found"
  }

  if (error.message && typeof error.message === "string") {
    // Sanitize error message to avoid leaking sensitive information
    return error.message.replace(/\b(password|token|key|secret)\b/gi, "***")
  }

  return "An error occurred while communicating with the database"
}
