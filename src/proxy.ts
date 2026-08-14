// Redirects "/" to "/sv" (or "/en") and keeps the language prefix on every URL.
// Called "proxy" since Next.js 16 — this was "middleware" in older versions.
//
// Do NOT put authorization here. Proxy runs before the request completes and is meant
// for routing, not permission checks. Membership is verified server-side in layouts and
// queries; see permissions.ts.

import createMiddleware from "next-intl/middleware"

import { routing } from "@/i18n/routing"

export default createMiddleware(routing)

export const config = {
  // Skip API routes, Next internals and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
}
