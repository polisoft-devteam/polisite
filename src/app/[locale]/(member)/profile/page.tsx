import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { NotificationList } from "@/components/NotificationList"
import { ProfileView } from "@/components/ProfileView"
import { Wishlist } from "@/components/Wishlist"
import {
  findPastEventsForMember,
  findUpcomingEventsForMember,
} from "@/features/events/queries"
import { findActivityFor } from "@/features/notifications/queries"
import { findWishlistForMember } from "@/features/wishlist/queries"
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

  const [upcomingEvents, pastEvents, wishlist, activity] = await Promise.all([
    findUpcomingEventsForMember(member.id),
    findPastEventsForMember(member.id),
    // Your own list, so the query returns no claims at all.
    findWishlistForMember(member.id, member.id),
    findActivityFor(viewer),
  ])

  return (
    <PageContainer>
      <ProfileView
        member={member}
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        isOwnProfile
        locale={locale}
        // Above the events, because it is the reason you followed the badge here.
        notifications={<NotificationList activity={activity} locale={locale} />}
      />

      <Wishlist entries={wishlist} isOwnList />
    </PageContainer>
  )
}
