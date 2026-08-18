// Supabase client for server components, server actions and route handlers.
//
// Used for AUTHENTICATION AND FILE STORAGE ONLY. Never query our own tables through it —
// members, events and wishlists go through Drizzle so there is one data path and one
// place permissions live. See CLAUDE.md.

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createSupabaseServerClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options)
            }
          } catch {
            // Server Components can't set cookies. Safe to ignore: proxy.ts refreshes
            // the session on every request, so the cookie is already up to date.
          }
        },
      },
    },
  )
}
