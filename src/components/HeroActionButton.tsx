// The one big button on the front page, under the tagline.
//
// It asks for the next thing you can actually do, which is different for everyone:
//
//   signed out  sign in with Google
//   guest       ask to join
//   member      make an event
//
// The look is its own, deliberately unlike the rest of the site's buttons: Vigge slides
// across and the label swaps as he goes. Sizes and offsets live in globals.css under
// "Hero action", because two labels crossing in opposite directions is a set of related
// transitions rather than a handful of utilities.

import { getTranslations } from "next-intl/server"

import { SignInButton } from "@/components/SignInButton"
import { SiteImage } from "@/components/SiteImage"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { canCreateEvent, isActiveMember } from "@/lib/permissions"

const KNIGHT = "/images/misc/viggeKnight.webp"

/** The label that slides out, and the one that slides in behind it. */
function Faces({ label, hoverLabel }: { label: string; hoverLabel: string }) {
  return (
    <>
      <span aria-hidden="true" className="hero-action-knight">
        <SiteImage
          src={KNIGHT}
          alt=""
          rounded=""
          className="size-9"
          sizes="2.25rem"
        />
      </span>

      <span className="hero-action-label">{label}</span>
      <span aria-hidden="true" className="hero-action-hover-label">
        {hoverLabel}
      </span>
    </>
  )
}

export async function HeroActionButton() {
  const translateHome = await getTranslations("Home")
  const viewer = await getViewer()

  // Nothing signed in: the only useful next step is Google.
  if (!viewer) {
    return (
      <SignInButton className="hero-action">
        <Faces
          label={translateHome("heroSignIn")}
          hoverLabel={translateHome("heroSignInHover")}
        />
      </SignInButton>
    )
  }

  if (isActiveMember(viewer) && canCreateEvent(viewer)) {
    return (
      <Link href="/events/new" transitionTypes={["nav-forward"]}>
        <span className="hero-action">
          <Faces
            label={translateHome("heroCreateEvent")}
            hoverLabel={translateHome("heroCreateEventHover")}
          />
        </span>
      </Link>
    )
  }

  // A guest who has already asked sees the pending pill instead; see SiteHero.
  const prompt = await findMembershipPrompt(viewer.authUserId)
  if (prompt) return null

  return (
    <form action={requestMembership}>
      <button type="submit" className="hero-action">
        <Faces
          label={translateHome("heroRequestMembership")}
          hoverLabel={translateHome("heroRequestMembershipHover")}
        />
      </button>
    </form>
  )
}
