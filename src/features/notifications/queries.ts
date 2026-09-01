// What has happened since you last looked.
//
// Derived from the tables we already keep rather than from a notifications table, which
// would be a second copy of the truth to keep in step. The cost is that a count is
// "everything newer than your last look" rather than per item read state, which is the
// right trade for ten people.
//
// A member who has never looked has no notificationsSeenAt. That is treated as the epoch,
// so the first visit shows the backlog rather than nothing.

import { and, count, eq, gt, isNull, ne } from "drizzle-orm"

import { db } from "@/db"
import { eventAttendees, events, members, membershipPrompts } from "@/db/schema"
import type { Viewer } from "@/lib/permissions"
import { canManageMembers, isActiveMember } from "@/lib/permissions"

export type NotificationCounts = {
  /** Guests who have asked to join. Admins only. */
  membershipRequests: number
  /** Google sign-ins that created a member row, whether or not they asked to join. */
  newSignUps: number
  /** Someone answered on an event you created. */
  responsesToMyEvents: number
  /** Events someone else created. */
  newEvents: number
  total: number
}

const EPOCH = new Date(0)

export async function findNotificationCounts(
  viewer: Viewer | null,
): Promise<NotificationCounts> {
  const empty: NotificationCounts = {
    membershipRequests: 0,
    newSignUps: 0,
    responsesToMyEvents: 0,
    newEvents: 0,
    total: 0,
  }

  if (!isActiveMember(viewer)) return empty

  const member = viewer!.member!
  const since = member.notificationsSeenAt ?? EPOCH
  const isAdminViewer = canManageMembers(viewer)

  const [requests, signUps, responses, createdEvents] = await Promise.all([
    isAdminViewer
      ? db
          .select({ value: count() })
          .from(membershipPrompts)
          .where(
            and(
              eq(membershipPrompts.response, "requested"),
              isNull(membershipPrompts.deniedAt),
              gt(membershipPrompts.respondedAt, since),
            ),
          )
      : [{ value: 0 }],

    isAdminViewer
      ? db
          .select({ value: count() })
          .from(members)
          .where(gt(members.createdAt, since))
      : [{ value: 0 }],

    // Your own answer on your own event is not news to you.
    db
      .select({ value: count() })
      .from(eventAttendees)
      .innerJoin(events, eq(events.id, eventAttendees.eventId))
      .where(
        and(
          eq(events.createdByMemberId, member.id),
          ne(eventAttendees.memberId, member.id),
          gt(eventAttendees.respondedAt, since),
        ),
      ),

    db
      .select({ value: count() })
      .from(events)
      .where(
        and(
          ne(events.createdByMemberId, member.id),
          gt(events.createdAt, since),
        ),
      ),
  ])

  const counts = {
    membershipRequests: requests[0]?.value ?? 0,
    newSignUps: signUps[0]?.value ?? 0,
    responsesToMyEvents: responses[0]?.value ?? 0,
    newEvents: createdEvents[0]?.value ?? 0,
  }

  return {
    ...counts,
    total: Object.values(counts).reduce((sum, value) => sum + value, 0),
  }
}

export async function markNotificationsSeen(memberId: string): Promise<void> {
  await db
    .update(members)
    .set({ notificationsSeenAt: new Date() })
    .where(eq(members.id, memberId))
}
