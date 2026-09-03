// One member's page.
//
// The same ProfileView the reader's own profile is built from, so a member looked at and a
// member looking see one page rather than two that drifted apart. What differs is the
// button in the corner: your own sends you to settings, an admin's to the edit screen, and
// everyone else gets none.

import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BackLink } from "@/components/BackLink"
import { MemberBadges } from "@/components/MemberBadges"
import { PageContainer } from "@/components/PageContainer"
import { ProfileView } from "@/components/ProfileView"
import { Wishlist } from "@/components/Wishlist"
import { Button } from "@/components/ui/button"
import {
  findPastEventsForMember,
  findUpcomingEventsForMember,
} from "@/features/events/queries"
import { memberDisplayName } from "@/features/members/identity"
import { findBadgesForMember, findMemberById } from "@/features/members/queries"
import { findWishlistForMember } from "@/features/wishlist/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { EditIcon, SettingsIcon } from "@/lib/icons"
import { canManageMembers } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/members/[memberId]">): Promise<Metadata> {
  const { memberId } = await params
  const member = await findMemberById(memberId)

  return { title: member ? memberDisplayName(member) : undefined }
}

export default async function MemberPage({
  params,
}: PageProps<"/[locale]/members/[memberId]">) {
  const { locale, memberId } = await params
  setRequestLocale(locale)

  const translateMembers = await getTranslations("Members")
  const translateProfile = await getTranslations("Profile")
  const translateAdmin = await getTranslations("Admin")

  const viewer = await getViewer()
  const member = await findMemberById(memberId)

  if (!member) notFound()

  const viewerMemberId = viewer?.member?.id ?? null
  const isOwnProfile = viewerMemberId === member.id

  const [entries, badges, upcomingEvents, pastEvents] = await Promise.all([
    findWishlistForMember(member.id, viewerMemberId),
    findBadgesForMember(member.id),
    findUpcomingEventsForMember(member.id),
    findPastEventsForMember(member.id),
  ])

  const action = isOwnProfile ? (
    <Button
      nativeButton={false}
      render={<Link href="/settings" transitionTypes={["nav-forward"]} />}
      size="sm"
      aria-label={translateProfile("settings")}
    >
      <SettingsIcon className="size-4" />
      <span className="hidden sm:inline">{translateProfile("settings")}</span>
    </Button>
  ) : canManageMembers(viewer) ? (
    <Button
      nativeButton={false}
      render={
        <Link
          href={`/admin/members/${member.id}`}
          transitionTypes={["nav-forward"]}
        />
      }
      variant="outline"
      size="sm"
      aria-label={translateAdmin("editProfile")}
    >
      <EditIcon className="size-4" />
      <span className="hidden sm:inline">{translateAdmin("editProfile")}</span>
    </Button>
  ) : null

  return (
    <PageContainer>
      {/* Back to where the members actually are. There is no directory page of its own;
          the table lives on About. */}
      <BackLink href="/about#members">{translateMembers("back")}</BackLink>

      <div className="mt-4">
        <ProfileView
          member={member}
          upcomingEvents={upcomingEvents}
          pastEvents={pastEvents}
          locale={locale}
          action={action}
        />
      </div>

      <MemberBadges
        badges={badges}
        locale={locale}
        isOwnProfile={isOwnProfile}
      />

      <Wishlist entries={entries} isOwnList={isOwnProfile} />
    </PageContainer>
  )
}
