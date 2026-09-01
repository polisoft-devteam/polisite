// An event stores a UTC instant plus the timezone where it physically happens.
//
// Both halves are needed. Without the zone, a London concert entered as 19:00 would show
// as 20:00 to a reader in Stockholm — technically the same instant, but not what anyone
// wants printed on a ticket. Without the instant, "when is it, really" has no answer.

import { format } from "date-fns"
import { fromZonedTime, toZonedTime } from "date-fns-tz"

import type { ReminderOffset } from "@/db/schema"

/** How many reminder pings one event may have. */
export const MAX_REMINDERS_PER_EVENT = 2

export const DEFAULT_EVENT_TIME_ZONE = "Europe/Stockholm"

/** Offered in the event form. A full IANA list is 400+ entries nobody needs. */
export const COMMON_EVENT_TIME_ZONES = [
  "Europe/Stockholm",
  "Europe/Copenhagen",
  "Europe/Oslo",
  "Europe/Helsinki",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Amsterdam",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Prague",
  "Europe/Warsaw",
  "Europe/Lisbon",
  "Atlantic/Reykjavik",
  "America/New_York",
  "UTC",
] as const

/** "2026-10-04T19:00" typed for a London event → the UTC instant it means. */
export function wallTimeToInstant(wallTime: string, timeZone: string): Date {
  return fromZonedTime(wallTime, timeZone)
}

/** A stored instant → "2026-10-04T19:00" to prefill a datetime-local input. */
export function instantToWallTime(instant: Date, timeZone: string): string {
  return format(toZonedTime(instant, timeZone), "yyyy-MM-dd'T'HH:mm")
}

/** What a new event's start and end are set to, so the form opens filled in. */
const DEFAULT_EVENT_HOUR = "10:00"

/**
 * Today and tomorrow at DEFAULT_EVENT_HOUR, as datetime-local strings.
 *
 * An empty datetime-local shows "dd/mm/yyyy, --:--", which reads as broken rather than as
 * a prompt. Today is read in the event's own timezone, and the day is stepped in UTC so a
 * daylight-saving change can't drag the hour with it.
 */
export function defaultEventWallTimes(timeZone: string) {
  const today = format(toZonedTime(new Date(), timeZone), "yyyy-MM-dd")

  const tomorrow = new Date(`${today}T00:00:00Z`)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  return {
    startsAt: `${today}T${DEFAULT_EVENT_HOUR}`,
    endsAt: `${tomorrow.toISOString().slice(0, 10)}T${DEFAULT_EVENT_HOUR}`,
  }
}

const DAY_IN_MS = 24 * 60 * 60 * 1000

/**
 * When a reminder for an event starting at startsAt should be posted.
 *
 * Arithmetic is deliberately in UTC. date-fns counts in local time, which would give a
 * different instant on a laptop in Copenhagen than on a Vercel server in UTC whenever the
 * span crosses a daylight-saving change. A reminder is sent by a daily job, so an hour
 * either way is irrelevant — matching production is not.
 */
export function reminderDueAt(startsAt: Date, offset: ReminderOffset): Date {
  switch (offset) {
    case "day_before":
      return new Date(startsAt.getTime() - DAY_IN_MS)
    case "week_before":
      return new Date(startsAt.getTime() - 7 * DAY_IN_MS)
    case "four_weeks_before":
      return new Date(startsAt.getTime() - 28 * DAY_IN_MS)
    case "four_months_before": {
      // Calendar months, so a 15 June event reminds on 15 February.
      const dueAt = new Date(startsAt)
      dueAt.setUTCMonth(dueAt.getUTCMonth() - 4)
      return dueAt
    }
  }
}

/** Discord renders this in each reader's own timezone, so no conversion is needed. */
export function toDiscordTimestamp(
  instant: Date,
  style: "F" | "R" = "F",
): string {
  return `<t:${Math.floor(instant.getTime() / 1000)}:${style}>`
}
