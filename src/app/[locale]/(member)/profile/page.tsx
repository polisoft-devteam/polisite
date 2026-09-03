import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
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
import { Link } from "@/i18n/navigation"
import { SettingsIcon } from "@/lib/icons"

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

  const translateProfile = await getTranslations("Profile")
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
        locale={locale}
        action={
          <Button
            nativeButton={false}
            render={<Link href="/settings" transitionTypes={["nav-forward"]} />}
            size="sm"
            aria-label={translateProfile("settings")}
          >
            <SettingsIcon className="size-4" />
            <span className="hidden sm:inline">
              {translateProfile("settings")}
            </span>
          </Button>
        }
        // Above the events, because it is the reason you followed the badge here.
        notifications={<NotificationList activity={activity} locale={locale} />}
      />

      <MemberBadges badges={badges} locale={locale} isOwnProfile />

      <Wishlist entries={wishlist} isOwnList />
    </PageContainer>
  )
}
