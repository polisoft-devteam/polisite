import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { MemberBadges } from "@/components/MemberBadges"
import { NotificationList } from "@/components/NotificationList"
import { ProfileView } from "@/components/ProfileView"
import { Wishlist } from "@/components/Wishlist"
import {
  findPastEventsForMember,
  findUpcomingEventsForMember,
} from "@/features/events/queries"
import { findBadgesForMember } from "@/features/members/queries"
import { findActivityFor } from "@/features/notifications/queries"
import { findWishlistForMember } from "@/features/wishlist/queries"
import { viewerAvatarUrl, viewerDisplayName } from "@/features/members/identity"
import { getViewer } from "@/lib/auth"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/profile">): Promise<Metadata> {
  const { locale } = await params
  const translateProfile = await getTranslations({
    locale,
    namespace: "Profile",
  })

  return { title: translateProfile("title") }
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profile">) {
  const { locale } = await params
  setRequestLocale(locale)

  const viewer = await getViewer()

  // The (member) layout already redirected anyone without an active membership.
  const member = viewer!.member!

  const [upcomingEvents, pastEvents, wishlist, activity, badges] =
    await Promise.all([
      findUpcomingEventsForMember(member.id),
      findPastEventsForMember(member.id),
      // Your own list, so the query returns no claims at all.
      findWishlistForMember(member.id, member.id),
      findActivityFor(viewer),
      findBadgesForMember(member.id),
    ])

  return (
    <PageContainer>
      <ProfileView
        member={{
          ...member,
          // Falls back to Google's, so the profile matches the header rather than showing
          // initials next to your own face.
          fullName: viewerDisplayName(viewer!),
          avatarUrl: viewerAvatarUrl(viewer!),
        }}
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        isOwnProfile
        locale={locale}
        // Above the events, because it is the reason you followed the badge here.
        notifications={<NotificationList activity={activity} locale={locale} />}
      />

      <MemberBadges badges={badges} locale={locale} />

      <Wishlist entries={wishlist} isOwnList />
    </PageContainer>
  )
}
