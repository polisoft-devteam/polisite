// Supabase client for client components (anything with "use client").
//
// Authentication only — see the note in server.ts. This runs in the browser, so it uses
// the publishable key, which is safe to expose.

import { createBrowserClient } from "@supabase/ssr"

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  )
}
