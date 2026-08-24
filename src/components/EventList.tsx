// A list of events under a heading, or an empty state.

import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import type { Event } from "@/db/schema"
import { EVENT_CATEGORY_ICON } from "@/features/events/labels"
import { Link } from "@/i18n/navigation"

export async function EventList({
  heading,
  emptyText,
  events,
  locale,
}: {
  heading: string
  emptyText: string
  events: Event[]
  locale: string
}) {
  const format = await getFormatter({ locale })
  const translateEvents = await getTranslations("Events")

  if (events.length === 0) {
    return (
      <PageSection heading={heading}>
        <EmptyState>{emptyText}</EmptyState>
      </PageSection>
    )
  }

  return (
    <PageSection heading={heading}>
      <ItemList>
        {events.map((event) => {
          const CategoryIcon = EVENT_CATEGORY_ICON[event.category]

          return (
            <li key={event.id}>
              <Link
                href={`/events/${event.slug}`}
                transitionTypes={["nav-forward"]}
                className="hover:bg-muted/50 flex flex-col gap-1 p-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="flex items-center gap-2 font-medium">
                  <CategoryIcon className="text-muted-foreground size-4 shrink-0" />
                  {event.title}
                </span>

                <span className="text-muted-foreground shrink-0 text-sm">
                  {event.startsAt ? (
                    <time dateTime={event.startsAt.toISOString()}>
                      {/* The event's own zone, so a London gig reads London time. */}
                      {format.dateTime(event.startsAt, {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: event.timeZone,
                      })}
                    </time>
                  ) : (
                    <span className="italic">
                      {translateEvents("dateNotDecided")}
                    </span>
                  )}
                  {event.visibility === "public" && (
                    <span className="ml-2 text-xs">
                      · {translateEvents("visibilityPublicShort")}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ItemList>
    </PageSection>
  )
}
