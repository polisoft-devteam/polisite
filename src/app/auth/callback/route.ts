// Where Google sends the member back after they approve the sign-in.
//
// Lives outside [locale] on purpose: the URL registered with Google is fixed, so it must
// not gain a /sv or /en prefix. proxy.ts excludes "auth" for the same reason.

import { NextResponse } from "next/server"

import { ensureMemberForSignIn } from "@/features/members/queries"
import { routing } from "@/i18n/routing"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  // Where to land afterwards. Set by the sign-in button so members come back to the page
  // they started on, in the language they were using.
  const returnTo = searchParams.get("returnTo") ?? `/${routing.defaultLocale}`

  // Only allow paths within this site — an absolute URL here would be an open redirect.
  const safeReturnTo = returnTo.startsWith("/")
    ? returnTo
    : `/${routing.defaultLocale}`

  if (code) {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user?.email) {
      // Creates a guest row on first sign-in. Google's name and picture arrive in
      // user_metadata and are only used to fill blanks.
      await ensureMemberForSignIn({
        authUserId: data.user.id,
        email: data.user.email,
        fullName: data.user.user_metadata.full_name ?? null,
        avatarUrl: data.user.user_metadata.avatar_url ?? null,
      })

      return NextResponse.redirect(`${origin}${safeReturnTo}`)
    }
  }

  return NextResponse.redirect(`${origin}${safeReturnTo}?authError=1`)
}
