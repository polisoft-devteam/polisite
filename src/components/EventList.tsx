// A list of events under a heading, or an empty state.

import { getFormatter, getTranslations } from "next-intl/server"

import type { Event } from "@/db/schema"
import { Link } from "@/i18n/navigation"

const CATEGORY_EMOJI: Record<Event["category"], string> = {
  music: "🎵",
  party: "🎉",
  trip: "✈️",
  hike: "🥾",
  sport: "🏅",
  food: "🍽️",
  board_meeting: "📋",
  birthday: "🎂",
  other: "📌",
}

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

  return (
    <section className="mt-10">
      <h2 className="text-lg font-medium">{heading}</h2>

      {events.length === 0 ? (
        <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {events.map((event) => (
            <li key={event.id}>
              <Link
                href={`/events/${event.id}`}
                transitionTypes={["nav-forward"]}
                className="hover:bg-muted/50 flex flex-col gap-1 p-4 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
              >
                <span className="font-medium">
                  {CATEGORY_EMOJI[event.category]} {event.title}
                </span>

                <span className="text-muted-foreground shrink-0 text-sm">
                  <time dateTime={event.startsAt.toISOString()}>
                    {/* Shown in the event's own zone, so a London gig reads London time. */}
                    {format.dateTime(event.startsAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: event.timeZone,
                    })}
                  </time>
                  {event.visibility === "public" && (
                    <span className="ml-2 text-xs">
                      · {translateEvents("visibilityPublicShort")}
                    </span>
                  )}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
