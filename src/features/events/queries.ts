// Database access for events. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.
//
// Every read takes the visibilities the viewer is allowed to see and filters on them in
// SQL. Fetching everything and hiding rows in the component would ship private data to
// the browser and only pretend to hide it.

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  isNull,
  lt,
  sql,
} from "drizzle-orm"

import { db } from "@/db"
import { buildEventSlug, toUniqueSlug } from "@/lib/slug"
import { DEFAULT_EVENT_TIME_ZONE } from "@/lib/time"
import {
  eventAttendees,
  eventDateOptions,
  eventDateVotes,
  eventGuests,
  eventReminders,
  events,
  members,
  type AttendanceResponse,
  type Event,
  type EventGuest,
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

/**
 * Suggestions with no date yet.
 *
 * They match neither upcoming (>= now) nor past (< now), because SQL comparisons exclude
 * nulls — so without this they appear nowhere at all.
 */
export async function findDatelessEvents(
  allowedVisibilities: EventVisibility[],
): Promise<Event[]> {
  if (allowedVisibilities.length === 0) return []

  return db
    .select()
    .from(events)
    .where(
      and(
        inArray(events.visibility, allowedVisibilities),
        isNull(events.startsAt),
      ),
    )
    .orderBy(desc(events.createdAt))
}

/** Looked up by the readable URL. Same null-for-forbidden rule as findEventById. */
export async function findEventBySlug(
  slug: string,
  allowedVisibilities: EventVisibility[],
): Promise<Event | null> {
  if (allowedVisibilities.length === 0) return null

  const [event] = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.slug, slug),
        inArray(events.visibility, allowedVisibilities),
      ),
    )
    .limit(1)

  return event ?? null
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

async function isSlugTaken(slug: string): Promise<boolean> {
  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1)

  return Boolean(existing)
}

export async function createEvent(
  event: Omit<NewEvent, "slug">,
  reminderOffsets: ReminderOffset[],
): Promise<Event> {
  const slug = await toUniqueSlug(
    buildEventSlug(event.title, event.startsAt ?? null, event.timeZone ?? ""),
    isSlugTaken,
  )

  const [created] = await db
    .insert(events)
    .values({ ...event, slug })
    .returning()

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

// --- Date poll ------------------------------------------------------------------

export type DateVoter = {
  memberId: string
  fullName: string
  avatarUrl: string | null
}

export type DateOptionWithVotes = {
  id: string
  startsAt: Date
  voters: DateVoter[]
  votedByViewer: boolean
}

/** Replaces the candidate dates wholesale. Votes for removed dates go with them. */
export async function replaceDateOptions(
  eventId: string,
  startsAtValues: Date[],
): Promise<void> {
  await db.delete(eventDateOptions).where(eq(eventDateOptions.eventId, eventId))

  if (startsAtValues.length > 0) {
    await db
      .insert(eventDateOptions)
      .values(startsAtValues.map((startsAt) => ({ eventId, startsAt })))
  }
}

export async function findDateOptionsForEvent(
  eventId: string,
  viewerMemberId: string | null,
): Promise<DateOptionWithVotes[]> {
  const options = await db
    .select()
    .from(eventDateOptions)
    .where(eq(eventDateOptions.eventId, eventId))
    .orderBy(asc(eventDateOptions.startsAt))

  if (options.length === 0) return []

  // Joined to members so the poll can show who voted, not just how many.
  const votes = await db
    .select({
      dateOptionId: eventDateVotes.dateOptionId,
      memberId: members.id,
      fullName: members.fullName,
      avatarUrl: members.avatarUrl,
    })
    .from(eventDateVotes)
    .innerJoin(members, eq(members.id, eventDateVotes.memberId))
    .where(
      inArray(
        eventDateVotes.dateOptionId,
        options.map((option) => option.id),
      ),
    )
    .orderBy(asc(members.fullName))

  return options.map((option) => {
    const optionVotes = votes.filter((vote) => vote.dateOptionId === option.id)

    return {
      id: option.id,
      startsAt: option.startsAt,
      // The join column isn't part of a voter; drop it rather than leak it outward.
      voters: optionVotes.map(({ dateOptionId, ...voter }) => voter),
      votedByViewer: optionVotes.some(
        (vote) => vote.memberId === viewerMemberId,
      ),
    }
  })
}

/** Adds or removes this member's vote for one date. */
export async function toggleDateVote(
  dateOptionId: string,
  memberId: string,
): Promise<void> {
  const existing = await db
    .select()
    .from(eventDateVotes)
    .where(
      and(
        eq(eventDateVotes.dateOptionId, dateOptionId),
        eq(eventDateVotes.memberId, memberId),
      ),
    )
    .limit(1)

  if (existing.length > 0) {
    await db
      .delete(eventDateVotes)
      .where(
        and(
          eq(eventDateVotes.dateOptionId, dateOptionId),
          eq(eventDateVotes.memberId, memberId),
        ),
      )
    return
  }

  await db.insert(eventDateVotes).values({ dateOptionId, memberId })
}

/** The event a date option belongs to, for permission checks. */
export async function findEventIdForDateOption(
  dateOptionId: string,
): Promise<string | null> {
  const [option] = await db
    .select({ eventId: eventDateOptions.eventId })
    .from(eventDateOptions)
    .where(eq(eventDateOptions.id, dateOptionId))
    .limit(1)

  return option?.eventId ?? null
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

/**
 * Everyone going, for a list of events, keyed by event id.
 *
 * One query for the whole page rather than one per card — a grid of twelve events would
 * otherwise be twelve round trips.
 */
export async function findGoingAttendeesByEvent(
  eventIds: string[],
): Promise<Map<string, Attendee[]>> {
  const byEvent = new Map<string, Attendee[]>()
  if (eventIds.length === 0) return byEvent

  const rows = await db
    .select({
      eventId: eventAttendees.eventId,
      memberId: members.id,
      fullName: members.fullName,
      nickname: members.nickname,
      avatarUrl: members.avatarUrl,
      response: eventAttendees.response,
    })
    .from(eventAttendees)
    .innerJoin(members, eq(members.id, eventAttendees.memberId))
    .where(
      and(
        inArray(eventAttendees.eventId, eventIds),
        eq(eventAttendees.response, "going"),
      ),
    )
    .orderBy(asc(members.fullName))

  for (const { eventId, ...attendee } of rows) {
    byEvent.set(eventId, [...(byEvent.get(eventId) ?? []), attendee])
  }

  return byEvent
}

/** This member's own answer, for rules that depend on whether they're going. */
export async function findAttendanceResponse(
  eventId: string,
  memberId: string,
): Promise<AttendanceResponse | null> {
  const [row] = await db
    .select({ response: eventAttendees.response })
    .from(eventAttendees)
    .where(
      and(
        eq(eventAttendees.eventId, eventId),
        eq(eventAttendees.memberId, memberId),
      ),
    )
    .limit(1)

  return row?.response ?? null
}

// --- Brought-along guests ------------------------------------------------------

export type EventGuestWithInviter = {
  id: string
  name: string
  invitedByMemberId: string
  invitedByName: string
}

export async function findGuestsForEvent(
  eventId: string,
): Promise<EventGuestWithInviter[]> {
  return db
    .select({
      id: eventGuests.id,
      name: eventGuests.name,
      invitedByMemberId: eventGuests.invitedByMemberId,
      invitedByName: members.fullName,
    })
    .from(eventGuests)
    .innerJoin(members, eq(members.id, eventGuests.invitedByMemberId))
    .where(eq(eventGuests.eventId, eventId))
    .orderBy(asc(eventGuests.addedAt))
}

/** Guests for a list of events, keyed by event id. Batched like the attendee faces. */
export async function findGuestsByEvent(
  eventIds: string[],
): Promise<Map<string, EventGuestWithInviter[]>> {
  const byEvent = new Map<string, EventGuestWithInviter[]>()
  if (eventIds.length === 0) return byEvent

  const rows = await db
    .select({
      eventId: eventGuests.eventId,
      id: eventGuests.id,
      name: eventGuests.name,
      invitedByMemberId: eventGuests.invitedByMemberId,
      invitedByName: members.fullName,
    })
    .from(eventGuests)
    .innerJoin(members, eq(members.id, eventGuests.invitedByMemberId))
    .where(inArray(eventGuests.eventId, eventIds))
    .orderBy(asc(eventGuests.addedAt))

  for (const { eventId, ...guest } of rows) {
    byEvent.set(eventId, [...(byEvent.get(eventId) ?? []), guest])
  }

  return byEvent
}

export async function addGuest(
  eventId: string,
  invitedByMemberId: string,
  name: string,
): Promise<void> {
  await db.insert(eventGuests).values({ eventId, invitedByMemberId, name })
}

export async function findGuestById(
  guestId: string,
): Promise<EventGuest | undefined> {
  const [guest] = await db
    .select()
    .from(eventGuests)
    .where(eq(eventGuests.id, guestId))
    .limit(1)

  return guest
}

export async function removeGuest(guestId: string): Promise<void> {
  await db.delete(eventGuests).where(eq(eventGuests.id, guestId))
}

/** How many guests a member has already brought, so the cap can be enforced. */
export async function countGuestsBroughtBy(
  eventId: string,
  memberId: string,
): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(eventGuests)
    .where(
      and(
        eq(eventGuests.eventId, eventId),
        eq(eventGuests.invitedByMemberId, memberId),
      ),
    )

  return row?.total ?? 0
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

/** Locks in a date the poll landed on, and stops the event being a suggestion. */
export async function setEventDateFromOption(
  eventId: string,
  dateOptionId: string,
): Promise<void> {
  const [option] = await db
    .select()
    .from(eventDateOptions)
    .where(
      and(
        eq(eventDateOptions.id, dateOptionId),
        eq(eventDateOptions.eventId, eventId),
      ),
    )
    .limit(1)

  if (!option) throw new Error("That date does not belong to this event")

  await db
    .update(events)
    .set({
      startsAt: option.startsAt,
      kind: "confirmed",
      updatedAt: new Date(),
    })
    .where(eq(events.id, eventId))
}

/**
 * How many events fall in each month of a year, keyed "YYYY-MM".
 *
 * Counted in SQL rather than by fetching a year of events and grouping here, and grouped
 * in the association's timezone so an event at 23:00 on the last of the month does not
 * count against the next one.
 *
 * The zone is written into the SQL rather than bound as a parameter: Postgres cannot infer
 * the type of a parameter in that position and refuses the query. It is a constant in this
 * file, never anything a request supplied.
 */
export async function findEventCountsByMonth(
  allowedVisibilities: EventVisibility[],
  year: number,
): Promise<Map<string, number>> {
  if (allowedVisibilities.length === 0) return new Map()

  const localStart = sql.raw(
    `"events"."starts_at" at time zone '${DEFAULT_EVENT_TIME_ZONE}'`,
  )

  const rows = await db
    .select({
      month: sql<string>`to_char(${localStart}, 'YYYY-MM')`.as("month"),
      total: count(),
    })
    .from(events)
    .where(
      and(
        inArray(events.visibility, allowedVisibilities),
        isNotNull(events.startsAt),
        sql`extract(year from ${localStart}) = ${year}`,
      ),
    )
    .groupBy(sql`to_char(${localStart}, 'YYYY-MM')`)

  return new Map(rows.map((row) => [row.month, Number(row.total)]))
}
