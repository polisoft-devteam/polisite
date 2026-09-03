// The badges themselves, as a shelf: small, unframed, ten to a row on a laptop, because
// the set wants to be taken in at a glance rather than read one card at a time.
//
// The same shelf serves three jobs, which is the only reason it takes a mode:
//
//   held        someone else's profile. Only what they hold.
//   all         your own profile. What you hold in colour, the rest greyed.
//   catalogue   the page that lists what exists. Everything in colour, no dates.
//
// A list of what a friend has failed to do is not a thing this site should render, which
// is why "all" is for your own profile and nobody else's.
//
// Artwork comes from public/images/badges/<key>.webp, keyed by the badge's own name. A
// badge with no file falls back to its icon, so the folder can be filled one at a time.
//
// At this size the description and the date have nowhere to go, so they arrive on hover
// instead: the badge lifts and a card under it says what it is and what it takes. The card
// is only faded out, never hidden, so a screen reader still reads it. A touch screen has no
// hover at all, which is what the /badges page is for.

import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
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

export type BadgeShelfMode = "held" | "all" | "catalogue"

type Shown = {
  definition: BadgeDefinition
  tier: number | null
  /** Shown in colour. Not the same as having a date: the catalogue has no dates. */
  isEarned: boolean
  awardedAt: Date | null
}

function shownBadges(badges: MemberBadge[], mode: BadgeShelfMode): Shown[] {
  if (mode === "catalogue") {
    return BADGES.map((definition) => ({
      definition,
      tier: null,
      isEarned: true,
      awardedAt: null,
    }))
  }

  // A key with no definition is skipped rather than rendered blank, so retiring a badge
  // does not break the profiles that were given it.
  const held: Shown[] = badges.flatMap((badge) => {
    const definition = findBadge(badge.badge)

    return definition
      ? [
          {
            definition,
            tier: badge.tier,
            isEarned: true,
            awardedAt: badge.awardedAt,
          },
        ]
      : []
  })

  if (mode === "held") return held

  const heldKeys = new Set(held.map((badge) => badge.definition.key))

  const rest: Shown[] = BADGES.filter(
    (definition) => !heldKeys.has(definition.key),
  ).map((definition) => ({
    definition,
    tier: null,
    isEarned: false,
    awardedAt: null,
  }))

  return [...held, ...rest]
}

export async function BadgeShelf({
  badges = [],
  locale,
  mode = "held",
}: {
  badges?: MemberBadge[]
  locale: string
  mode?: BadgeShelfMode
}) {
  const translateBadges = await getTranslations("Badges")
  const format = await getFormatter({ locale })
  const artwork = await readBadgeImages()

  const shown = shownBadges(badges, mode)

  if (shown.length === 0)
    return <EmptyState>{translateBadges("empty")}</EmptyState>

  return (
    <ul className="flex flex-wrap gap-3">
      {shown.map(({ definition, tier, isEarned, awardedAt }) => {
        const { key, Icon } = definition
        const image = artwork.get(key)
        const name = badgeTitle(translateBadges(`${key}.title`), tier)

        const when = awardedAt
          ? format.dateTime(awardedAt, { year: "numeric", month: "long" })
          : isEarned
            ? null
            : translateBadges("notEarned")

        const description = translateBadges(`${key}.description`)

        return (
          <li
            key={key}
            className={cn(
              "badge relative flex w-24 flex-col items-center gap-1.5 text-center",
              !isEarned && "opacity-40 grayscale",
            )}
          >
            <span className="badge-art">
              {image ? (
                <SiteImage
                  src={image}
                  alt=""
                  rounded="rounded-full"
                  className="size-14"
                  sizes="56px"
                />
              ) : (
                <span className="bg-primary/15 text-primary-ink flex size-14 items-center justify-center rounded-full">
                  <Icon className="size-7" />
                </span>
              )}
            </span>

            <span className="text-[11px] leading-tight font-medium">
              {name}
            </span>

            {/* Above the shelf's own stacking, so the badge beside it cannot cover it, and
                deaf to the pointer so it cannot take a hover of its own. */}
            <span className="badge-card border-border bg-card text-muted-foreground pointer-events-none absolute top-full left-1/2 z-20 mt-1 w-44 rounded-lg border p-3 text-left text-xs shadow-lg">
              <span className="text-foreground block font-medium">{name}</span>
              <span className="mt-1 block">{description}</span>
              {when && (
                <span className="mt-1 block text-[0.625rem] tracking-wide uppercase">
                  {when}
                </span>
              )}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
