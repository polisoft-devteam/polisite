// The front page's hero: the photographs in public/images/hero, crossfading behind the
// association's name. The frame and the wave cut belong to PhotoHero, which an event page
// uses too.
//
// Under the tagline, a signed-in guest gets the one thing they can usefully do here. Once
// they have asked, the button becomes the answer to "did that work", because the letter
// they asked from only ever appears once.

import { getTranslations } from "next-intl/server"

import { PhotoHero } from "@/components/PhotoHero"
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { ASSOCIATION_NAME } from "@/lib/association"
import { readHeroImages } from "@/lib/hero-images"
import { isActiveMember } from "@/lib/permissions"

export async function SiteHero() {
  const translateHome = await getTranslations("Home")
  const heroImages = await readHeroImages()
  const viewer = await getViewer()

  // Signed out there is nothing to ask with yet, and a member has nothing to ask for.
  const canAsk = viewer !== null && !isActiveMember(viewer)
  const prompt = canAsk ? await findMembershipPrompt(viewer.authUserId) : null

  return (
    <PhotoHero
      images={heroImages}
      title={translateHome("title")}
      tagline={translateHome("heroTagline", {
        associationName: ASSOCIATION_NAME,
      })}
    >
      {/* Turned down: no button, because the unique key means asking twice records
          nothing, and a button that writes nothing is worse than none. */}
      {canAsk && !prompt?.deniedAt ? (
        prompt?.response === "requested" ? (
          <p className="rounded-full bg-white/15 px-3 py-1.5 text-sm text-white ring-1 ring-white/30 backdrop-blur-sm">
            {translateHome("membershipPending")}
          </p>
        ) : (
          <form action={requestMembership}>
            <Button type="submit">{translateHome("requestMembership")}</Button>
          </form>
        )
      ) : null}
    </PhotoHero>
  )
}
