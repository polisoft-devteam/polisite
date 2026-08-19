// Database access for events. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.

import { and, asc, desc, eq, gte, lt } from "drizzle-orm"

import { db } from "@/db"
import { eventAttendees, events, type Event } from "@/db/schema"

/** Events this member said they're going to, that haven't happened yet. */
export async function findUpcomingEventsForMember(
  memberId: string,
): Promise<Event[]> {
  const rows = await db
    .select({ event: events })
    .from(eventAttendees)
    .innerJoin(events, eq(events.id, eventAttendees.eventId))
    .where(
      and(
        eq(eventAttendees.memberId, memberId),
        eq(eventAttendees.response, "going"),
        gte(events.startsAt, new Date()),
      ),
    )
    .orderBy(asc(events.startsAt))

  return rows.map((row) => row.event)
}

/** Events this member said they'd go to, that have already happened. */
export async function findPastEventsForMember(
  memberId: string,
): Promise<Event[]> {
  const rows = await db
    .select({ event: events })
    .from(eventAttendees)
    .innerJoin(events, eq(events.id, eventAttendees.eventId))
    .where(
      and(
        eq(eventAttendees.memberId, memberId),
        eq(eventAttendees.response, "going"),
        lt(events.startsAt, new Date()),
      ),
    )
    .orderBy(desc(events.startsAt))

  return rows.map((row) => row.event)
}
