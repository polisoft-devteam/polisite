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
import { isActiveMember } from "@/lib/permissions"
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

/** What a profile is before anything has been saved: their Google account, and nothing. */
const BLANK_PROFILE = {
  id: "",
  authUserId: null,
  email: "",
  nickname: null,
  officialTitle: null,
  bio: null,
  githubUrl: null,
  displayedBadge: null,
  birthday: null,
  lastBirthdayGreetingYear: null,
  status: "inactive" as const,
  joinedAssociationAt: null,
  notificationsSeenAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profile">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateProfile = await getTranslations("Profile")
  const viewer = await getViewer()

  // A guest waiting on an admin has no row yet: signing in writes nothing, and the first
  // save is what creates one. Until then this is their Google account, shown as a profile.
  const member = viewer!.member

  const [upcomingEvents, pastEvents, wishlist, activity, badges] =
    await Promise.all([
      member ? findUpcomingEventsForMember(member.id) : [],
      member ? findPastEventsForMember(member.id) : [],
      // Your own list, so the query returns no claims at all.
      member ? findWishlistForMember(member.id, member.id) : [],
      findActivityFor(viewer),
      member ? findBadgesForMember(member.id) : [],
    ])

  return (
    <PageContainer>
      <ProfileView
        member={{
          ...(member ?? BLANK_PROFILE),
          // Falls back to Google's, so the profile matches the header rather than showing
          // initials next to your own face.
          fullName: viewerDisplayName(viewer!),
          avatarUrl: viewerAvatarUrl(viewer!),
        }}
        upcomingEvents={upcomingEvents}
        pastEvents={pastEvents}
        locale={locale}
        isOwnProfile
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

      <Wishlist
        entries={wishlist}
        isOwnList
        canClaim={isActiveMember(viewer)}
      />
    </PageContainer>
  )
}
