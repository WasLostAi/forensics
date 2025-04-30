import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create a singleton instance of the Supabase client
const createSingletonClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if we have the required environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key is missing. Using mock mode.")

    // Return a mock client that won't throw errors but will log warnings
    return {
      from: () => ({
        select: () => ({
          order: () => ({
            then: (callback: any) => Promise.resolve(callback({ data: [], error: null })),
            single: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
          }),
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
          }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
          }),
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
            }),
          }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: null }),
        }),
      }),
      auth: {
        signUp: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
        signIn: () => Promise.resolve({ data: null, error: { message: "Mock mode active" } }),
        signOut: () => Promise.resolve({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      },
    }
  }

  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  })
}

// Export the singleton instance
export const supabase = createSingletonClient()

// Export a function that returns the singleton instance for server-side usage
export const createClient = () => {
  return supabase
}
