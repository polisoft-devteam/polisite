// A member's patches.
//
// The database stores a key; the icon and the copy come from features/members/badges.ts
// and the message files. A key with no definition is skipped rather than rendered blank,
// so removing a badge from the list does not break the profiles that were given it.
//
// Artwork, if there is any, comes from public/images/badges/<key>.webp — see
// lib/site-images.ts. A badge with no file falls back to its icon, so the folder can be
// filled one badge at a time.
//
// On your own profile the ones you have not earned are shown too, greyed, because a badge
// nobody can see is not something to aim for. On someone else's only what they hold is
// shown: a list of what a friend has failed to do is not a thing this site should render.

import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { PageSection } from "@/components/PageSection"
import { SiteImage } from "@/components/SiteImage"
import type { MemberBadge } from "@/db/schema"
import {
  BADGES,
  badgeTitle,
  findBadge,
  type BadgeDefinition,
} from "@/features/members/badges"
import { readBadgeImages } from "@/lib/site-images"
import { cn } from "@/lib/utils"

type Shown = {
  definition: BadgeDefinition
  tier: number | null
  awardedAt: Date | null
}

export async function MemberBadges({
  badges,
  locale,
  showUnearned = false,
}: {
  badges: MemberBadge[]
  locale: string
  /** Their own profile, where what is still to come is worth seeing. */
  showUnearned?: boolean
}) {
  const translateBadges = await getTranslations("Badges")
  const format = await getFormatter({ locale })
  const artwork = await readBadgeImages()

  const held: Shown[] = badges.flatMap((badge) => {
    const definition = findBadge(badge.badge)

    return definition
      ? [{ definition, tier: badge.tier, awardedAt: badge.awardedAt }]
      : []
  })

  const heldKeys = new Set(held.map((badge) => badge.definition.key))

  const unearned: Shown[] = showUnearned
    ? BADGES.filter((definition) => !heldKeys.has(definition.key)).map(
        (definition) => ({ definition, tier: null, awardedAt: null }),
      )
    : []

  const shown = [...held, ...unearned]

  return (
    <PageSection id="badges" heading={translateBadges("title")}>
      {shown.length === 0 ? (
        <EmptyState>{translateBadges("empty")}</EmptyState>
      ) : (
        <ul className="flex flex-wrap gap-3">
          {shown.map(({ definition, tier, awardedAt }) => {
            const { key, Icon } = definition
            const image = artwork.get(key)
            const isEarned = awardedAt !== null

            return (
              <li
                key={key}
                className={cn(
                  "border-border bg-card flex w-40 flex-col items-center gap-2 rounded-lg border p-4 text-center",
                  !isEarned && "opacity-45 grayscale",
                )}
              >
                {image ? (
                  <SiteImage
                    src={image}
                    alt=""
                    rounded="rounded-full"
                    className="size-12"
                    sizes="48px"
                  />
                ) : (
                  <span className="bg-primary/15 text-primary-ink flex size-12 items-center justify-center rounded-full">
                    <Icon className="size-6" />
                  </span>
                )}

                <span className="text-sm font-medium">
                  {badgeTitle(translateBadges(`${key}.title`), tier)}
                </span>

                <span className="text-muted-foreground text-xs">
                  {translateBadges(`${key}.description`)}
                </span>

                {awardedAt ? (
                  <time
                    dateTime={awardedAt.toISOString()}
                    className="text-muted-foreground text-[0.625rem] tracking-wide uppercase"
                  >
                    {format.dateTime(awardedAt, {
                      year: "numeric",
                      month: "short",
                    })}
                  </time>
                ) : (
                  <span className="text-muted-foreground text-[0.625rem] tracking-wide uppercase">
                    {translateBadges("notEarned")}
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </PageSection>
  )
}
