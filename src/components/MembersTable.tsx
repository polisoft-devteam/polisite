// The members, as a row each with links out to what they keep elsewhere.
//
// Lives on the About page rather than behind a menu item of its own: it is part of who the
// association is, and one row per person is not a section that needs its own page.
//
// Members only. It is a list of real people, so a guest gets nothing, and the caller
// decides that rather than this component hiding rows.

import { getTranslations } from "next-intl/server"

import { ItemList } from "@/components/ItemList"
import { MemberLink } from "@/components/MemberLink"
import { findActiveMembersForDirectory } from "@/features/members/queries"
import { Link } from "@/i18n/navigation"
import { GithubIcon, WishlistIcon } from "@/lib/icons"

export async function MembersTable() {
  const translateMembers = await getTranslations("Members")
  const members = await findActiveMembersForDirectory()

  return (
    <ItemList>
      {members.map((member) => (
        <li
          key={member.id}
          className="flex items-center justify-between gap-4 p-3"
        >
          <MemberLink member={member} />

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
