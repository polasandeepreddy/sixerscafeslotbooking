import { createClient } from "@supabase/supabase-js"

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Create a singleton instance of the Supabase client
let supabaseInstance = null

export const getSupabase = () => {
  // Only create the instance if it doesn't exist yet
  if (!supabaseInstance && supabaseUrl && supabaseAnonKey) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  }

  if (!supabaseInstance) {
    // Instead of throwing an error, return a mock client for static rendering
    if (typeof window === "undefined") {
      console.warn("Supabase client not available during static rendering")
      return createMockClient()
    }
    console.error("Could not create Supabase client. Check your environment variables.")
  }

  return supabaseInstance || createMockClient()
}

// Create a mock client for static rendering
function createMockClient() {
  return {
    from: () => ({
      select: () => ({ data: [], error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: [], error: null }),
      neq: () => ({ data: [], error: null }),
      order: () => ({ data: [], error: null }),
      limit: () => ({ data: [], error: null }),
      range: () => ({ data: [], error: null }),
    }),
    rpc: () => ({ data: null, error: null }),
  }
}

export const supabase = getSupabase()
