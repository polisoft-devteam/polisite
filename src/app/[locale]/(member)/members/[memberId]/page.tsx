// One member's page: who they are, and their wishlist.
//
// Reached from the directory. Members only, like the directory itself.

import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BackLink } from "@/components/BackLink"
import { ExternalLink } from "@/components/ExternalLink"
import { MemberAvatar } from "@/components/MemberAvatar"
import { MemberBadges } from "@/components/MemberBadges"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Wishlist } from "@/components/Wishlist"
import { findBadgesForMember, findMemberById } from "@/features/members/queries"
import { isMemberTitle } from "@/features/members/titles"
import { findWishlistForMember } from "@/features/wishlist/queries"
import { getViewer } from "@/lib/auth"
import { GithubIcon } from "@/lib/icons"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/members/[memberId]">): Promise<Metadata> {
  const { memberId } = await params
  const member = await findMemberById(memberId)

  return { title: member?.nickname ?? member?.fullName }
}

export default async function MemberPage({
  params,
}: PageProps<"/[locale]/members/[memberId]">) {
  const { locale, memberId } = await params
  setRequestLocale(locale)

  const translateMembers = await getTranslations("Members")
  const translateTitles = await getTranslations("Titles")
  const viewer = await getViewer()
  const member = await findMemberById(memberId)

  if (!member) notFound()

  const viewerMemberId = viewer?.member?.id ?? null
  const isOwnList = viewerMemberId === member.id

  const [entries, badges] = await Promise.all([
    findWishlistForMember(member.id, viewerMemberId),
    findBadgesForMember(member.id),
  ])

  return (
    <PageContainer>
      <BackLink href="/members">{translateMembers("back")}</BackLink>

      <div className="mt-4 flex items-center gap-4">
        <MemberAvatar
          fullName={member.fullName}
          avatarUrl={member.avatarUrl}
          className="size-16"
        />

        <div className="min-w-0">
          <PageHeading
            title={member.nickname ?? member.fullName}
            eyebrow={
              member.officialTitle && isMemberTitle(member.officialTitle)
                ? translateTitles(member.officialTitle)
                : undefined
            }
          />
        </div>
      </div>

      {member.bio && <p className="mt-4 max-w-2xl text-sm">{member.bio}</p>}

      {member.githubUrl && (
        <div className="mt-4 text-sm">
          <ExternalLink href={member.githubUrl}>
            <GithubIcon className="size-3.5" />
            {translateMembers("github")}
          </ExternalLink>
        </div>
      )}

      <MemberBadges badges={badges} locale={locale} />

      <Wishlist entries={entries} isOwnList={isOwnList} />
    </PageContainer>
  )
}
