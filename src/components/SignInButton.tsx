// "Sign in with Google" in the header. Client-side because starting OAuth needs to read
// the current origin and then navigate the browser to Google.

"use client"

import { useLocale, useTranslations } from "next-intl"

import { Button } from "@/components/ui/button"
import { usePathname } from "@/i18n/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"

export function SignInButton() {
  const translateAuth = useTranslations("Auth")
  const currentLocale = useLocale()
  // Already stripped of the /sv or /en prefix by next-intl.
  const currentPathname = usePathname()

  async function startGoogleSignIn() {
    const supabase = createSupabaseBrowserClient()

    // Come back to the page they started on, in the language they were reading.
    const returnTo =
      currentPathname === "/"
        ? `/${currentLocale}`
        : `/${currentLocale}${currentPathname}`

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?returnTo=${encodeURIComponent(returnTo)}`,
      },
    })
  }

  // The full label is too wide for a phone header.
  return (
    <Button size="sm" onClick={startGoogleSignIn}>
      <span className="sm:hidden">{translateAuth("signInShort")}</span>
      <span className="hidden sm:inline">{translateAuth("signIn")}</span>
    </Button>
  )
}
