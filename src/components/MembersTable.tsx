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
import { Link } from "@/i18n/navigation"
import { readBadgeImages } from "@/lib/site-images"
import { GithubIcon, WishlistIcon } from "@/lib/icons"

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
          className="flex items-center justify-between gap-4 p-3"
        >
          <MemberLink
            member={member}
            secondaryLine={
              <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
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
                      className="size-4"
                      sizes="16px"
                    />
                  ) : (
                    <span
                      key={held.badge}
                      title={name}
                      className="bg-primary/15 text-primary-ink flex size-4 items-center justify-center rounded-full"
                    >
                      <definition.Icon className="size-2.5" />
                    </span>
                  )
                })}
              </span>
            }
          />

          <div className="text-muted-foreground flex shrink-0 items-center gap-1">
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

            <Link
              href={`/members/${member.id}`}
              transitionTypes={["nav-forward"]}
              aria-label={translateMembers("wishlist")}
              className="hover:text-foreground p-2"
            >
              <WishlistIcon className="size-4" />
            </Link>
          </div>
        </li>
      ))}
    </ItemList>
  )
}
