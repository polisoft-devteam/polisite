// Where Google sends the member back after they approve the sign-in.
//
// Lives outside [locale] on purpose: the URL registered with Google is fixed, so it must
// not gain a /sv or /en prefix. proxy.ts excludes "auth" for the same reason.

import { NextResponse } from "next/server"

import { fillMemberGapsFromGoogle } from "@/features/members/queries"
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

    // Signing in makes someone a Google user, not a member: nothing is stored about a
    // guest. For someone who is already a member, this is the one moment Google's name
    // and picture are in hand, so any gaps in their row get filled from it.
    if (!error && data.user?.email) {
      const metadata = data.user.user_metadata ?? {}

      await fillMemberGapsFromGoogle(data.user.id, {
        name:
          (metadata.full_name as string | undefined) ??
          (metadata.name as string | undefined) ??
          null,
        avatarUrl:
          (metadata.avatar_url as string | undefined) ??
          (metadata.picture as string | undefined) ??
          null,
      })

      return NextResponse.redirect(`${origin}${safeReturnTo}`)
    }
  }

  return NextResponse.redirect(`${origin}${safeReturnTo}?authError=1`)
}
