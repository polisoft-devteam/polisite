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
// At this size there is no room to say what a badge takes, so the badge turns over and
// says it on its back, in the same footprint so nothing else on the shelf moves. Both faces
// are in the page, so a screen reader reads the description whether or not anything is
// hovered. A touch screen has no hover at all, which is what the /badges page is for.

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

        const description = translateBadges(`${key}.description`)

        const when = awardedAt
          ? format.dateTime(awardedAt, { year: "numeric", month: "long" })
          : isEarned
            ? null
            : translateBadges("notEarned")

        return (
          <li
            key={key}
            className={cn(
              "badge relative flex w-24 cursor-help flex-col items-center gap-1.5 text-center",
              !isEarned && "opacity-40 grayscale",
            )}
          >
            <span className="badge-flip relative block h-16 w-24">
              <span className="badge-faces absolute inset-0">
                <span className="badge-front absolute inset-0 flex items-center justify-center">
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

                {/* Clipped rather than allowed to grow: every tile on the shelf is the
                    same size, and a long description must not be the one that is not. */}
                <span className="badge-back border-border bg-card text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-0.5 overflow-hidden rounded-md border px-1 text-center text-[9px] leading-[1.15]">
                  <span>{description}</span>
                  {when && (
                    <span className="text-[8px] tracking-wide uppercase opacity-70">
                      {when}
                    </span>
                  )}
                </span>
              </span>
            </span>

            <span className="text-[11px] leading-tight font-medium">
              {name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
