// A month grid. Hand-built rather than pulling in a calendar library: what we need is a
// seven-column grid, and doing it here keeps the page a server component so the
// visibility filtering never leaves the server.
//
// Month navigation is a link with ?month=YYYY-MM, so it works without JavaScript.
// The date arithmetic lives in lib/calendar.ts, in UTC, and is tested there.

import { formatInTimeZone } from "date-fns-tz"

import { getTranslations } from "next-intl/server"

import { CalendarTile } from "@/components/CalendarTile"
import { Button } from "@/components/ui/button"
import type { Event } from "@/db/schema"
import { Link } from "@/i18n/navigation"
import {
  BirthdayCakeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@/lib/icons"
import {
  addMonthsUtc,
  buildMonthGridDays,
  toDayKey,
  toMonthParam,
} from "@/lib/calendar"
import { DEFAULT_EVENT_TIME_ZONE } from "@/lib/time"
import { cn } from "@/lib/utils"

/** Which square an event belongs in, judged in the event's own timezone. */
function dayKeyForEvent(event: Event & { startsAt: Date }): string {
  return formatInTimeZone(event.startsAt, event.timeZone, "yyyy-MM-dd")
}

/** Suggestions awaiting a date poll have no square to sit in. */
function hasDate(event: Event): event is Event & { startsAt: Date } {
  return event.startsAt !== null
}

export type CalendarBirthday = {
  id: string
  name: string
  avatarUrl: string | null
  /** yyyy-mm-dd, the year being whenever they were born. */
  birthday: string
}

export async function EventCalendar({
  month,
  events,
  birthdays,
  monthCounts,
  locale,
}: {
  month: Date
  events: Event[]
  birthdays: CalendarBirthday[]
  /** Events per month of the shown year, keyed "YYYY-MM". */
  monthCounts: Map<string, number>
  locale: string
}) {
  const translateEvents = await getTranslations("Events")

  const days = buildMonthGridDays(month)

  const eventsByDay = new Map<string, (Event & { startsAt: Date })[]>()
  for (const event of events.filter(hasDate)) {
    const key = dayKeyForEvent(event)
    eventsByDay.set(key, [...(eventsByDay.get(key) ?? []), event])
  }

  // Keyed by month and day, so a birthday lands every year rather than only the one
  // someone was born in.
  const birthdaysByMonthDay = new Map<string, CalendarBirthday[]>()
  for (const birthday of birthdays) {
    const key = birthday.birthday.slice(5)
    birthdaysByMonthDay.set(key, [
      ...(birthdaysByMonthDay.get(key) ?? []),
      birthday,
    ])
  }

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(month)

  const shortMonthFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  })

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
            <ChevronLeftIcon className="size-4" />
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
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      </div>

      {/* Every month of the shown year, with how many events are in it. The arrows still
          work, and still reach the years either side; this is for the common case of
          jumping a few months rather than stepping. */}
      <nav className="border-border mt-4 flex flex-wrap gap-1 border-b pb-2">
        {Array.from({ length: 12 }, (_, index) => {
          const target = new Date(Date.UTC(month.getUTCFullYear(), index, 1))
          const param = toMonthParam(target)
          const count = monthCounts.get(param) ?? 0
          const isShown = index === shownMonth

          return (
            <Link
              key={param}
              href={`/calendar?month=${param}`}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-sm transition-colors",
                isShown
                  ? "text-foreground bg-muted font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <span className="first-letter:uppercase">
                {shortMonthFormatter.format(target)}
              </span>
              {count > 0 && (
                <span className="bg-primary/20 text-foreground rounded-full px-1.5 text-[0.625rem] font-semibold tabular-nums">
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="bg-border mt-4 grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
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
                    <CalendarTile
                      href={`/events/${event.slug}`}
                      imageUrl={event.imageUrl}
                      lead={formatInTimeZone(
                        event.startsAt,
                        event.timeZone,
                        "HH:mm",
                      )}
                      title={event.title}
                    />
                  </li>
                ))}

                {(birthdaysByMonthDay.get(key.slice(5)) ?? []).map(
                  (birthday) => (
                    <li key={`birthday-${birthday.id}`}>
                      <CalendarTile
                        href={`/members/${birthday.id}`}
                        imageUrl={birthday.avatarUrl}
                        icon={<BirthdayCakeIcon className="size-3" />}
                        title={birthday.name}
                        tone="birthday"
                      />
                    </li>
                  ),
                )}
              </ul>
            </div>
          )
        })}
      </div>
    </>
  )
}
