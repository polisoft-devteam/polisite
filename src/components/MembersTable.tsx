// The members, as a row each with links out to what they keep elsewhere.
//
// Lives on the About page rather than behind a menu item of its own: it is part of who the
// association is, and one row per person is not a section that needs its own page.
//
// Members only. It is a list of real people, so a guest gets nothing, and the caller
// decides that rather than this component hiding rows.
//
// Each row carries what the association has said about that person: the office they hold,
// and the patches they have earned. Small, under the name, because the row is a way to
// reach someone rather than a profile in itself.

import { getTranslations } from "next-intl/server"

import { ItemList } from "@/components/ItemList"
import { MemberLink } from "@/components/MemberLink"
import { SiteImage } from "@/components/SiteImage"
import { badgeTitle, findBadge } from "@/features/members/badges"
import {
  findActiveMembersForDirectory,
  findBadgesByMember,
} from "@/features/members/queries"
import { isMemberTitle } from "@/features/members/titles"
import { readBadgeImages } from "@/lib/site-images"
import { ChevronRightIcon, GithubIcon } from "@/lib/icons"

export async function MembersTable() {
  const translateMembers = await getTranslations("Members")
  const translateTitles = await getTranslations("Titles")
  const translateBadges = await getTranslations("Badges")

  const [members, badgesByMember, artwork] = await Promise.all([
    findActiveMembersForDirectory(),
    findBadgesByMember(),
    readBadgeImages(),
  ])

  return (
    <ItemList>
      {members.map((member) => (
        <li
          key={member.id}
          // The whole row fills, not the name alone: it is one thing to press, and a
          // strip that lights up under half its own width reads as a mistake.
          // data-sweep is what globals.css keys the fill on.
          data-slot="button"
          data-sweep="true"
          className="member-row flex min-h-18 items-center justify-between gap-4 px-4 py-3 [--button-accent-foreground:var(--color-primary-foreground)] [--button-accent:var(--color-primary)]"
        >
          <MemberLink
            member={member}
            size="lg"
            plain
            className="flex-1"
            secondaryLine={
              <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {member.officialTitle &&
                  isMemberTitle(member.officialTitle) && (
                    <span className="text-muted-foreground text-xs">
                      {translateTitles(member.officialTitle)}
                    </span>
                  )}

                {(badgesByMember.get(member.id) ?? []).map((held) => {
                  const definition = findBadge(held.badge)
                  if (!definition) return null

                  const image = artwork.get(definition.key)
                  const name = badgeTitle(
                    translateBadges(`${definition.key}.title`),
                    held.tier,
                  )

                  return image ? (
                    <SiteImage
                      key={held.badge}
                      src={image}
                      alt={name}
                      rounded="rounded-full"
                      className="size-5"
                      sizes="20px"
                    />
                  ) : (
                    <span
                      key={held.badge}
                      title={name}
                      className="bg-primary/15 text-primary-ink flex size-5 items-center justify-center rounded-full"
                    >
                      <definition.Icon className="size-3" />
                    </span>
                  )
                })}
              </span>
            }
          />

          {/* Slides in on hover, so the row says where it goes rather than only lighting
              up. Hidden from a screen reader: the name beside it is already the link. */}
          <span
            aria-hidden="true"
            className="member-goto hidden shrink-0 items-center gap-1 text-xs font-medium md:flex"
          >
            {translateMembers("goToProfile")}
            <ChevronRightIcon className="size-3" />
          </span>

          <div className="member-row-icon text-muted-foreground flex shrink-0 items-center gap-1">
            {member.githubUrl && (
              <a
                href={member.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={translateMembers("github")}
                className="hover:text-foreground p-2"
              >
                <GithubIcon className="size-4" />
              </a>
            )}
          </div>
        </li>
      ))}
    </ItemList>
  )
}
