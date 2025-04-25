import { createClient } from "@supabase/supabase-js"

export function createMiddlewareClient(supabaseUrl: string, supabaseKey: string) {
  return createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
    global: {
      fetch: (...args) => fetch(...args),
    },
  })
}
