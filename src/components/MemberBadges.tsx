// The badge section on a profile: the heading, a line or two saying what these are and how
// they arrive, then the shelf itself.
//
// The shelf is BadgeShelf, shared with the page that lists every badge. This is only the
// framing a profile needs around it.

import { getTranslations } from "next-intl/server"

import { BadgeShelf } from "@/components/BadgeShelf"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import type { MemberBadge } from "@/db/schema"
import { Link } from "@/i18n/navigation"
import { ChevronRightIcon } from "@/lib/icons"

export async function MemberBadges({
  badges,
  locale,
  isOwnProfile = false,
}: {
  badges: MemberBadge[]
  locale: string
  /** Their own, where what is still to come is worth seeing and worth explaining. */
  isOwnProfile?: boolean
}) {
  const translateBadges = await getTranslations("Badges")

  return (
    <PageSection id="badges" heading={translateBadges("title")}>
      {/* Only on your own. On someone else's, instructions for earning badges are
          instructions for the wrong person. */}
      {isOwnProfile && (
        <p className="text-muted-foreground max-w-prose text-sm">
          {translateBadges("intro")}
        </p>
      )}

      <BadgeShelf
        badges={badges}
        locale={locale}
        mode={isOwnProfile ? "all" : "held"}
      />

      {isOwnProfile && (
        <Button
          nativeButton={false}
          variant="ghost"
          size="sm"
          render={<Link href="/badges" transitionTypes={["nav-forward"]} />}
        >
          {translateBadges("seeAll")}
          <ChevronRightIcon className="size-3" />
        </Button>
      )}
    </PageSection>
  )
}
