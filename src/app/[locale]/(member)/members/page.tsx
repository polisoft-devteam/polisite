// The members directory: a row per member, with links out to what they keep elsewhere.
//
// Members only. It is a list of real people, so a guest never sees it, and the (member)
// layout has already turned anyone else away.

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ItemList } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { findActiveMembersForDirectory } from "@/features/wishlist/queries"
import { Link } from "@/i18n/navigation"
import { GithubIcon, WishlistIcon } from "@/lib/icons"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/members">): Promise<Metadata> {
  const { locale } = await params
  const translateMembers = await getTranslations({
    locale,
    namespace: "Members",
  })

  return { title: translateMembers("title") }
}

export default async function MembersPage({
  params,
}: PageProps<"/[locale]/members">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateMembers = await getTranslations("Members")
  const members = await findActiveMembersForDirectory()

  return (
    <PageContainer>
      <PageHeading title={translateMembers("title")} />

      <div className="mt-6">
        <ItemList>
          {members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between gap-4 p-3"
            >
              <Link
                href={`/members/${member.id}`}
                transitionTypes={["nav-forward"]}
                className="flex min-w-0 items-center gap-3"
              >
                <MemberAvatar
                  fullName={member.fullName}
                  avatarUrl={member.avatarUrl}
                />
                <span className="truncate text-sm font-medium">
                  {member.nickname ?? member.fullName}
                </span>
              </Link>

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
      </div>
    </PageContainer>
  )
}
