// What has happened lately, and how much of it you have not seen.
//
// Derived from the tables we already keep plus one timestamp per member, rather than a
// notifications table, which would be a second copy of the truth to keep in step. The
// trade is that "unread" is everything newer than your last look rather than per item
// read state, which is the right trade for ten people.
//
// The list itself is not filtered by that timestamp: reading it once should not empty the
// section for good. Only the count on the badge is.

import { and, desc, eq, gte, isNull, ne } from "drizzle-orm"

import { db } from "@/db"
import { eventAttendees, events, members, membershipPrompts } from "@/db/schema"
import type { Viewer } from "@/lib/permissions"
import { canManageMembers, isActiveMember } from "@/lib/permissions"

export type ActivityKind =
  /** A guest asked to join. Admins only. */
  | "membershipRequest"
  /** A Google sign-in created a member row. Admins only. */
  | "signUp"
  /** Someone answered on an event you created. */
  | "responseToMyEvent"
  /** Someone else created an event. */
  | "newEvent"

export type ActivityItem = {
  /** Unique per row, so React keys survive two things happening in the same second. */
  key: string
  kind: ActivityKind
  /** The person it is about, when there is one. */
  who: string | null
  /** The event it is about, when there is one. */
  what: string | null
  /** Where the thing itself is. */
  href: string
  at: Date
}

/** Old news is not news. Keeps the section short without paging it. */
const ACTIVITY_WINDOW_DAYS = 30
const ACTIVITY_LIMIT = 20

export type Activity = {
  items: ActivityItem[]
  /** How many of them are newer than the viewer's last look. */
  unseenCount: number
}

const EMPTY: Activity = { items: [], unseenCount: 0 }

export async function findActivityFor(
  viewer: Viewer | null,
): Promise<Activity> {
  if (!isActiveMember(viewer)) return EMPTY

  const member = viewer!.member!
  const since = new Date(
    Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000,
  )
  const isAdminViewer = canManageMembers(viewer)

  const [requests, signUps, responses, createdEvents] = await Promise.all([
    isAdminViewer
      ? db
          .select({
            email: membershipPrompts.email,
            fullName: membershipPrompts.fullName,
            at: membershipPrompts.respondedAt,
          })
          .from(membershipPrompts)
          .where(
            and(
              eq(membershipPrompts.response, "requested"),
              isNull(membershipPrompts.deniedAt),
              gte(membershipPrompts.respondedAt, since),
            ),
          )
          .orderBy(desc(membershipPrompts.respondedAt))
          .limit(ACTIVITY_LIMIT)
      : [],

    isAdminViewer
      ? db
          .select({
            id: members.id,
            fullName: members.fullName,
            nickname: members.nickname,
            at: members.createdAt,
          })
          .from(members)
          .where(and(gte(members.createdAt, since), ne(members.id, member.id)))
          .orderBy(desc(members.createdAt))
          .limit(ACTIVITY_LIMIT)
      : [],

    // Your own answer on your own event is not news to you.
    db
      .select({
        memberId: eventAttendees.memberId,
        fullName: members.fullName,
        nickname: members.nickname,
        eventTitle: events.title,
        eventSlug: events.slug,
        at: eventAttendees.respondedAt,
      })
      .from(eventAttendees)
      .innerJoin(events, eq(events.id, eventAttendees.eventId))
      .innerJoin(members, eq(members.id, eventAttendees.memberId))
      .where(
        and(
          eq(events.createdByMemberId, member.id),
          ne(eventAttendees.memberId, member.id),
          gte(eventAttendees.respondedAt, since),
        ),
      )
      .orderBy(desc(eventAttendees.respondedAt))
      .limit(ACTIVITY_LIMIT),

    db
      .select({
        title: events.title,
        slug: events.slug,
        fullName: members.fullName,
        nickname: members.nickname,
        at: events.createdAt,
      })
      .from(events)
      .innerJoin(members, eq(members.id, events.createdByMemberId))
      .where(
        and(
          ne(events.createdByMemberId, member.id),
          gte(events.createdAt, since),
        ),
      )
      .orderBy(desc(events.createdAt))
      .limit(ACTIVITY_LIMIT),
  ])

  const items: ActivityItem[] = [
    ...requests.map((row) => ({
      key: `request-${row.email}-${row.at.getTime()}`,
      kind: "membershipRequest" as const,
      who: row.fullName ?? row.email,
      what: null,
      href: "/admin",
      at: row.at,
    })),

    ...signUps.map((row) => ({
      key: `signup-${row.id}`,
      kind: "signUp" as const,
      who: row.nickname ?? row.fullName,
      what: null,
      href: `/members/${row.id}`,
      at: row.at,
    })),

    ...responses.map((row) => ({
      key: `response-${row.memberId}-${row.eventSlug}-${row.at.getTime()}`,
      kind: "responseToMyEvent" as const,
      who: row.nickname ?? row.fullName,
      what: row.eventTitle,
      href: `/events/${row.eventSlug}`,
      at: row.at,
    })),

    ...createdEvents.map((row) => ({
      key: `event-${row.slug}`,
      kind: "newEvent" as const,
      who: row.nickname ?? row.fullName,
      what: row.title,
      href: `/events/${row.slug}`,
      at: row.at,
    })),
  ]
    .sort((first, second) => second.at.getTime() - first.at.getTime())
    .slice(0, ACTIVITY_LIMIT)

  const lastLooked = member.notificationsSeenAt

  return {
    items,
    unseenCount:
      lastLooked === null
        ? items.length
        : items.filter((item) => item.at > lastLooked).length,
  }
}

/** Just the badge's number, for the header, without building the list. */
export async function countUnseenActivity(
  viewer: Viewer | null,
): Promise<number> {
  const { unseenCount } = await findActivityFor(viewer)
  return unseenCount
}

export async function markNotificationsSeen(memberId: string): Promise<void> {
  await db
    .update(members)
    .set({ notificationsSeenAt: new Date() })
    .where(eq(members.id, memberId))
}
