// Top bar shown on every page: association name, navigation, theme and language switches.
// Below `md` the links move into MobileNav's hamburger.

import { getTranslations } from "next-intl/server"

import { AuthMenu } from "@/components/AuthMenu"
import { LanguageToggle } from "@/components/LanguageToggle"
import { MainNav } from "@/components/MainNav"
import { MobileNav } from "@/components/MobileNav"
import {
  NotificationBell,
  type NotificationLine,
} from "@/components/NotificationBell"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Wordmark } from "@/components/Wordmark"
import { Link } from "@/i18n/navigation"
import { findNotificationCounts } from "@/features/notifications/queries"
import { getViewer } from "@/lib/auth"
import { canManageMembers, isActiveMember } from "@/lib/permissions"

export async function SiteHeader() {
  const viewer = await getViewer()
  const showAdminLink = canManageMembers(viewer)

  const translateNotifications = await getTranslations("Notifications")
  const counts = await findNotificationCounts(viewer)

  // Only the kinds that actually have something in them, each pointing at where the thing
  // is. A count of zero is not news.
  const notificationLines: NotificationLine[] = (
    [
      {
        key: "membershipRequests",
        count: counts.membershipRequests,
        href: "/admin",
      },
      { key: "newSignUps", count: counts.newSignUps, href: "/admin" },
      {
        key: "responsesToMyEvents",
        count: counts.responsesToMyEvents,
        href: "/profile",
      },
      { key: "newEvents", count: counts.newEvents, href: "/events" },
    ] as const
  )
    .filter((line) => line.count > 0)
    .map((line) => ({ ...line, label: translateNotifications(line.key) }))

  return (
    <header
      // Named so the CSS can hold it still while the page content slides beneath it.
      style={{ viewTransitionName: "site-header" }}
      className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 sm:gap-2">
        <Link href="/" transitionTypes={["nav-back"]} className="mr-1 sm:mr-2">
          <Wordmark />
        </Link>

        <MainNav showAdminLink={showAdminLink} />

        <div className="ml-auto flex items-center gap-1">
          {isActiveMember(viewer) && (
            <NotificationBell
              lines={notificationLines}
              total={counts.total}
              label={translateNotifications("label")}
              emptyLabel={translateNotifications("empty")}
            />
          )}

          <LanguageToggle />
          <ThemeToggle />
          <AuthMenu />
          <div className="md:hidden">
            <MobileNav showAdminLink={showAdminLink} />
          </div>
        </div>
      </div>
    </header>
  )
}
