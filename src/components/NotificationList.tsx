// What has happened lately, on your own profile.
//
// The list is not filtered by what you have already seen: reading it once should not empty
// the section for good. Unseen rows are marked, and opening the page clears the badge.

import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { ItemList } from "@/components/ItemList"
import { MarkNotificationsSeen } from "@/components/MarkNotificationsSeen"
import { PageSection } from "@/components/PageSection"
import type { Activity } from "@/features/notifications/queries"
import { Link } from "@/i18n/navigation"

export async function NotificationList({
  activity,
  locale,
}: {
  activity: Activity
  locale: string
}) {
  const translateNotifications = await getTranslations("Notifications")
  const format = await getFormatter({ locale })

  const lastSeenBoundary = activity.items.length - activity.unseenCount

  return (
    <PageSection id="notifications" heading={translateNotifications("title")}>
      {activity.unseenCount > 0 && <MarkNotificationsSeen />}

      {activity.items.length === 0 ? (
        <EmptyState>{translateNotifications("empty")}</EmptyState>
      ) : (
        <ItemList>
          {activity.items.map((item, index) => (
            <li key={item.key}>
              <Link
                href={item.href}
                transitionTypes={["nav-forward"]}
                className="hover:bg-muted flex items-center justify-between gap-4 p-3 transition-colors"
              >
                <span className="min-w-0 text-sm">
                  {index < lastSeenBoundary ? null : (
                    <span
                      aria-hidden="true"
                      className="bg-notification mr-2 inline-block size-1.5 rounded-full align-middle"
                    />
                  )}
                  {translateNotifications(item.kind, {
                    who: item.who ?? "",
                    what: item.what ?? "",
                  })}
                </span>

                <time
                  dateTime={item.at.toISOString()}
                  className="text-muted-foreground shrink-0 text-xs"
                >
                  {format.dateTime(item.at, {
                    day: "numeric",
                    month: "short",
                  })}
                </time>
              </Link>
            </li>
          ))}
        </ItemList>
      )}
    </PageSection>
  )
}
