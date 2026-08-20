// A month grid. Hand-built rather than pulling in a calendar library: what we need is a
// seven-column grid, and doing it here keeps the page a server component so the
// visibility filtering never leaves the server.
//
// Month navigation is a link with ?month=YYYY-MM, so it works without JavaScript.
// The date arithmetic lives in lib/calendar.ts, in UTC, and is tested there.

import { formatInTimeZone } from "date-fns-tz"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import type { Event } from "@/db/schema"
import { Link } from "@/i18n/navigation"
import {
  addMonthsUtc,
  buildMonthGridDays,
  toDayKey,
  toMonthParam,
} from "@/lib/calendar"
import { DEFAULT_EVENT_TIME_ZONE } from "@/lib/time"
import { cn } from "@/lib/utils"

/** Which square an event belongs in, judged in the event's own timezone. */
function dayKeyForEvent(event: Event): string {
  return formatInTimeZone(event.startsAt, event.timeZone, "yyyy-MM-dd")
}

export async function EventCalendar({
  month,
  events,
  locale,
}: {
  month: Date
  events: Event[]
  locale: string
}) {
  const translateEvents = await getTranslations("Events")

  const days = buildMonthGridDays(month)

  const eventsByDay = new Map<string, Event[]>()
  for (const event of events) {
    const key = dayKeyForEvent(event)
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month)

  const weekdayFormatter = new Intl.DateTimeFormat(locale, {
    weekday: "short",
    timeZone: "UTC",
  })

  const todayKey = formatInTimeZone(
    new Date(),
    DEFAULT_EVENT_TIME_ZONE,
    "yyyy-MM-dd",
  )
  const shownMonth = month.getUTCMonth()

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight first-letter:uppercase">
          {monthLabel}
        </h1>

        <div className="flex gap-1">
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/calendar?month=${toMonthParam(addMonthsUtc(month, -1))}`}
              />
            }
            variant="outline"
            size="icon-sm"
            aria-label={translateEvents("previousMonth")}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/calendar?month=${toMonthParam(addMonthsUtc(month, 1))}`}
              />
            }
            variant="outline"
            size="icon-sm"
            aria-label={translateEvents("nextMonth")}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </div>

      <div className="bg-border mt-6 grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
        {days.slice(0, 7).map((day) => (
          <div
            key={`weekday-${toDayKey(day)}`}
            className="bg-muted text-muted-foreground px-2 py-1.5 text-center text-xs font-medium first-letter:uppercase"
          >
            {weekdayFormatter.format(day)}
          </div>
        ))}

        {days.map((day) => {
          const key = toDayKey(day)
          const dayEvents = eventsByDay.get(key) ?? []
          const isOutsideShownMonth = day.getUTCMonth() !== shownMonth
          const isToday = key === todayKey

          return (
            <div
              key={key}
              className={cn(
                "bg-background min-h-20 p-1.5 sm:min-h-28",
                isOutsideShownMonth && "bg-muted/40",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-xs",
                  isOutsideShownMonth && "text-muted-foreground",
                  isToday && "bg-primary text-primary-foreground font-medium",
                )}
              >
                {day.getUTCDate()}
              </span>

              <ul className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/events/${event.id}`}
                      transitionTypes={["nav-forward"]}
                      title={event.title}
                      className="bg-primary/10 hover:bg-primary/20 block truncate rounded px-1.5 py-0.5 text-[11px] leading-tight transition-colors"
                    >
                      {formatInTimeZone(
                        event.startsAt,
                        event.timeZone,
                        "HH:mm",
                      )}{" "}
                      {event.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>
    </>
  )
}
