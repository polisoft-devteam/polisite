// Runs on every incoming request, before any page renders.
//
// Two jobs:
//   1. Redirects "/" to "/sv" (or "/en") and keeps the language prefix on every URL.
//   2. Refreshes the Supabase session cookie so it doesn't expire mid-visit.
//
// Called "proxy" since Next.js 16 — this was "middleware" in older versions.
//
// Refreshing a cookie is NOT an authorization check. Do NOT decide who may see what
// here: proxy runs before the request completes and is meant for routing. Membership is
// verified server-side in layouts and queries; see permissions.ts.

import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

const handleLocaleRouting = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  // Locale routing decides the response first — it may be a redirect. The refreshed
  // auth cookies are then written onto whatever response it produced.
  const response = handleLocaleRouting(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Calling getUser() is what triggers the refresh. Without it the session silently
  // expires and members get signed out mid-session.
  await supabase.auth.getUser()

  return response
}

export const config = {
  // Skip API routes, the OAuth callback, Next internals and anything with a file
  // extension. "auth" must be excluded or the callback URL would gain a /sv prefix
  // and no longer match what Google redirects to.
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
}
