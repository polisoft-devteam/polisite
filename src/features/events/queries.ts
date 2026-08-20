// Database access for events. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.
//
// Every read takes the visibilities the viewer is allowed to see and filters on them in
// SQL. Fetching everything and hiding rows in the component would ship private data to
// the browser and only pretend to hide it.

import { and, asc, desc, eq, gte, inArray, lt, sql } from "drizzle-orm"

import { db } from "@/db"
import {
  eventAttendees,
  eventReminders,
  events,
  members,
  type AttendanceResponse,
  type Event,
  type EventVisibility,
  type NewEvent,
  type ReminderOffset,
} from "@/db/schema"

export async function findUpcomingEvents(
  allowedVisibilities: EventVisibility[],
): Promise<Event[]> {
  if (allowedVisibilities.length === 0) return []

  return db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.visibility, allowedVisibilities),
        gte(events.startsAt, new Date()),
      ),
    )
    .orderBy(asc(events.startsAt))
}

export async function findPastEvents(
  allowedVisibilities: EventVisibility[],
): Promise<Event[]> {
  if (allowedVisibilities.length === 0) return []

  return db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.visibility, allowedVisibilities),
        lt(events.startsAt, new Date()),
      ),
    )
    .orderBy(desc(events.startsAt))
}

/** Events overlapping a date range, for the calendar grid. */
export async function findEventsInRange(
  allowedVisibilities: EventVisibility[],
  from: Date,
  to: Date,
): Promise<Event[]> {
  if (allowedVisibilities.length === 0) return []

  return db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.visibility, allowedVisibilities),
        gte(events.startsAt, from),
        lt(events.startsAt, to),
      ),
    )
    .orderBy(asc(events.startsAt))
}

/** Null when the event doesn't exist *or* this viewer may not see it — same answer. */
export async function findEventById(
  eventId: string,
  allowedVisibilities: EventVisibility[],
): Promise<Event | null> {
  if (allowedVisibilities.length === 0) return null

  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.id, eventId),
        inArray(events.visibility, allowedVisibilities),
      ),
    )
    .limit(1)

  return event ?? null
}

export async function createEvent(
  event: NewEvent,
  reminderOffsets: ReminderOffset[],
): Promise<Event> {
  const [created] = await db.insert(events).values(event).returning()

  if (reminderOffsets.length > 0) {
    await db
      .insert(eventReminders)
      .values(
        reminderOffsets.map((offset) => ({ eventId: created.id, offset })),
      )
      .onConflictDoNothing()
  }

  return created
}

export async function updateEvent(
  eventId: string,
  event: Partial<NewEvent>,
  reminderOffsets: ReminderOffset[],
): Promise<void> {
  await db
    .update(events)
    .set({ ...event, updatedAt: new Date() })
    .where(eq(events.id, eventId))

  // Reminders already sent are left alone; only pending ones are replaced.
  await db
    .delete(eventReminders)
    .where(
      and(
        eq(eventReminders.eventId, eventId),
        sql`${eventReminders.sentAt} is null`,
      ),
    )

  if (reminderOffsets.length > 0) {
    await db
      .insert(eventReminders)
      .values(reminderOffsets.map((offset) => ({ eventId, offset })))
      .onConflictDoNothing()
  }
}

export async function deleteEvent(eventId: string): Promise<void> {
  await db.delete(events).where(eq(events.id, eventId))
}

export async function findReminderOffsetsForEvent(
  eventId: string,
): Promise<ReminderOffset[]> {
  const rows = await db
    .select({ offset: eventReminders.offset })
    .from(eventReminders)
    .where(eq(eventReminders.eventId, eventId))

  return rows.map((row) => row.offset)
}

// --- Reminders due to be sent ---------------------------------------------------

export type PendingReminder = {
  event: Event
  offset: ReminderOffset
}

/**
 * Unsent reminders for events that haven't happened yet.
 *
 * Whether each one is actually due is decided in TypeScript by reminderDueAt, so the
 * offset arithmetic lives in one tested place rather than being duplicated in SQL.
 */
export async function findUnsentRemindersForUpcomingEvents(): Promise<
  PendingReminder[]
> {
  const rows = await db
    .select({ event: events, offset: eventReminders.offset })
    .from(eventReminders)
    .innerJoin(events, eq(events.id, eventReminders.eventId))
    .where(
      and(
        sql`${eventReminders.sentAt} is null`,
        gte(events.startsAt, new Date()),
      ),
    )
    .orderBy(asc(events.startsAt))

  return rows
}

export async function markReminderSent(
  eventId: string,
  offset: ReminderOffset,
): Promise<void> {
  await db
    .update(eventReminders)
    .set({ sentAt: new Date() })
    .where(
      and(
        eq(eventReminders.eventId, eventId),
        eq(eventReminders.offset, offset),
      ),
    )
}

// --- Attendance ----------------------------------------------------------------

export type Attendee = {
  memberId: string
  fullName: string
  nickname: string | null
  avatarUrl: string | null
  response: AttendanceResponse
}

export async function findAttendeesForEvent(
  eventId: string,
): Promise<Attendee[]> {
  return db
    .select({
      memberId: members.id,
      fullName: members.fullName,
      nickname: members.nickname,
      avatarUrl: members.avatarUrl,
      response: eventAttendees.response,
    })
    .from(eventAttendees)
    .innerJoin(members, eq(members.id, eventAttendees.memberId))
    .where(eq(eventAttendees.eventId, eventId))
    .orderBy(asc(members.fullName))
}

export async function setAttendance(
  eventId: string,
  memberId: string,
  response: AttendanceResponse,
): Promise<void> {
  await db
    .insert(eventAttendees)
    .values({ eventId, memberId, response })
    .onConflictDoUpdate({
      target: [eventAttendees.eventId, eventAttendees.memberId],
      set: { response, respondedAt: new Date() },
    })
}

/** Events this member is going to, upcoming first. Used on profiles. */
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
