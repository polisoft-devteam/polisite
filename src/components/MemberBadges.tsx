// A member's patches.
//
// The database stores a key; the icon and the copy come from features/members/badges.ts
// and the message files. A key with no definition is skipped rather than rendered blank,
// so removing a badge from the list does not break the profiles that were given it.

import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { PageSection } from "@/components/PageSection"
import type { MemberBadge } from "@/db/schema"
import { badgeTitle, findBadge } from "@/features/members/badges"

export async function MemberBadges({
  badges,
  locale,
}: {
  badges: MemberBadge[]
  locale: string
}) {
  const translateBadges = await getTranslations("Badges")
  const format = await getFormatter({ locale })

  const awarded = badges.flatMap((badge) => {
    const definition = findBadge(badge.badge)
    return definition ? [{ ...badge, definition }] : []
  })

  return (
    <PageSection id="badges" heading={translateBadges("title")}>
      {awarded.length === 0 ? (
        <EmptyState>{translateBadges("empty")}</EmptyState>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {awarded.map(({ badge, tier, awardedAt, definition }) => {
            const { Icon } = definition

            return (
              <li
                key={badge}
                className="border-border bg-card flex w-40 flex-col items-center gap-2 rounded-lg border p-4 text-center"
              >
                <span className="bg-primary/15 text-primary-ink flex size-12 items-center justify-center rounded-full">
                  <Icon className="size-6" />
                </span>

                <span className="text-sm font-medium">
                  {badgeTitle(translateBadges(`${badge}.title`), tier)}
                </span>

                <span className="text-muted-foreground text-xs">
                  {translateBadges(`${badge}.description`)}
                </span>

                <time
                  dateTime={awardedAt.toISOString()}
                  className="text-muted-foreground text-[0.625rem] tracking-wide uppercase"
                >
                  {format.dateTime(awardedAt, {
                    year: "numeric",
                    month: "short",
                  })}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </PageSection>
  )
}
