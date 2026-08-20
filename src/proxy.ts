// Runs on every incoming request, before any page renders.
// Keeps the /sv or /en prefix on every URL, and refreshes the Supabase session cookie.
// Never decide who may see what here — that belongs in permissions.ts.

import { createServerClient } from "@supabase/ssr"
import type { NextRequest } from "next/server"
import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

const handleLocaleRouting = createMiddleware(routing)

export default async function proxy(request: NextRequest) {
  const responseWithLocaleRouting = handleLocaleRouting(request)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(refreshedCookies) {
          for (const { name, value, options } of refreshedCookies) {
            responseWithLocaleRouting.cookies.set(name, value, options)
          }
        },
      },
    },
  )

  // Calling getUser() is what triggers the refresh.
  await supabase.auth.getUser()

  return responseWithLocaleRouting
}

export const config = {
  // "auth" is excluded so the OAuth callback URL never gains a language prefix.
  matcher: "/((?!api|auth|_next|_vercel|.*\\..*).*)",
}
