// The one big button on the front page, under the tagline.
//
// It asks for the next thing you can actually do, which differs by who is looking:
//
//   signed out  sign in with Google
//   guest       ask to join
//   member      make an event
//
// Uses the site's own button rather than a style of its own, so there is one button
// design to maintain. Only the size is different, because it is the single call to action
// on the page it sits on.

import { getTranslations } from "next-intl/server"

import { SignInButton } from "@/components/SignInButton"
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { GoogleIcon, NewEventIcon } from "@/lib/icons"
import { canCreateEvent, isActiveMember } from "@/lib/permissions"

// Bigger than anything else on the site, but a hero is not a billboard.
const HERO_BUTTON = "h-11 gap-2 px-6 text-base"

export async function HeroActionButton() {
  const translateHome = await getTranslations("Home")
  const viewer = await getViewer()

  if (!viewer) {
    return (
      <SignInButton className={HERO_BUTTON}>
        {translateHome("heroSignIn")}
      </SignInButton>
    )
  }

  if (isActiveMember(viewer) && canCreateEvent(viewer)) {
    return (
      <Button
        nativeButton={false}
        className={HERO_BUTTON}
        render={<Link href="/events/new" transitionTypes={["nav-forward"]} />}
      >
        <NewEventIcon className="size-5" />
        {translateHome("heroCreateEvent")}
      </Button>
    )
  }

  // A guest who has already asked gets the pending pill instead; see SiteHero.
  const prompt = await findMembershipPrompt(viewer.authUserId)
  if (prompt) return null

  return (
    <form action={requestMembership}>
      <Button type="submit" className={HERO_BUTTON}>
        <GoogleIcon className="size-5" />
        {translateHome("heroRequestMembership")}
      </Button>
    </form>
  )
}
