import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development"

// Create a mock client that returns empty data for all operations
const createMockClient = () => {
  console.warn("Using mock Supabase client. Database operations will return mock data.")

  return {
    from: () => ({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
        in: () => Promise.resolve({ data: [], error: null }),
        or: () => Promise.resolve({ data: [], error: null }),
        not: () => Promise.resolve({ data: [], error: null }),
        contains: () => Promise.resolve({ data: [], error: null }),
        limit: () => Promise.resolve({ data: [], error: null }),
        single: () => Promise.resolve({ data: null, error: null }),
        group: () => Promise.resolve({ data: [], error: null }),
        count: 0,
        data: [],
        error: null,
      }),
      insert: () => ({
        select: () => ({
          single: () => Promise.resolve({ data: {}, error: null }),
        }),
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: {}, error: null }),
          }),
        }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ error: null }),
      }),
    }),
    rpc: () => Promise.resolve({ error: null }),
    auth: {
      signUp: () => Promise.resolve({ data: {}, error: null }),
      signIn: () => Promise.resolve({ data: {}, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    },
  }
}

// Get environment variables with fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a real or mock client based on environment variables
let supabaseClient: any

try {
  // Only create a real client if we have valid credentials
  if (supabaseUrl && supabaseAnonKey) {
    supabaseClient = supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    })

    // Test the client by making a simple query
    supabaseClient
      .from("entity_labels")
      .select("*", { count: "exact", head: true })
      .then(({ error }: any) => {
        if (error) {
          console.warn("Supabase client initialization failed:", error.message)
          supabaseClient = createMockClient()
        }
      })
      .catch((err: any) => {
        console.warn("Supabase client test failed:", err.message)
        supabaseClient = createMockClient()
      })
  } else {
    console.warn("Supabase URL or API key is missing. Using mock client.")
    supabaseClient = createMockClient()
  }
} catch (error) {
  console.warn("Error initializing Supabase client:", error)
  supabaseClient = createMockClient()
}

// Export the client
export const supabase = supabaseClient

// Export a function that returns the client for compatibility
export const createClient = () => {
  return supabase
}

// Export a function that returns a server-side client with service role key
export const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (supabaseUrl && supabaseServiceKey) {
    try {
      return supabaseCreateClient<Database>(supabaseUrl, supabaseServiceKey, {
        auth: {
          persistSession: false,
        },
      })
    } catch (error) {
      console.warn("Error initializing server Supabase client:", error)
      return createMockClient()
    }
  }

  console.warn("Server Supabase URL or service key is missing. Using mock client.")
  return createMockClient()
}

// Export a flag indicating if we're using mock data
export const isMockData = !supabaseUrl || !supabaseAnonKey || supabaseClient === createMockClient()
