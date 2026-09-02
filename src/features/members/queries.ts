// Database access for members. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.

import { and, asc, eq, isNotNull, isNull, or, sql } from "drizzle-orm"

import { db } from "@/db"
import type { MemberBadge } from "@/db/schema"
import { memberNameFrom } from "@/features/members/display-name"
import {
  memberRoles,
  members,
  membershipPrompts,
  type Member,
  type MembershipPrompt,
  type Role,
  memberBadges,
} from "@/db/schema"

export async function findMemberByAuthUserId(
  authUserId: string,
): Promise<Member | null> {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.authUserId, authUserId))
    .limit(1)

  return member ?? null
}

export type EditableProfileFields = {
  fullName: string
  nickname: string | null
  bio: string | null
  githubUrl: string | null
  /** Omitted when no new photo was uploaded, so the existing one is kept. */
  avatarUrl?: string
}

/** Only the fields a member is allowed to change about themselves. */
export async function updateMemberProfile(
  memberId: string,
  fields: EditableProfileFields,
): Promise<void> {
  await db
    .update(members)
    .set({ ...fields, updatedAt: new Date() })
    .where(eq(members.id, memberId))
}

export async function findRolesForMember(memberId: string): Promise<Role[]> {
  const rows = await db
    .select({ role: memberRoles.role })
    .from(memberRoles)
    .where(eq(memberRoles.memberId, memberId))

  return rows.map((row) => row.role)
}

// --- Membership prompt ----------------------------------------------------------

export async function findMembershipPrompt(
  authUserId: string,
): Promise<MembershipPrompt | null> {
  const [prompt] = await db
    .select()
    .from(membershipPrompts)
    .where(eq(membershipPrompts.authUserId, authUserId))
    .limit(1)

  return prompt ?? null
}

/**
 * Records that someone answered the welcome prompt, so it never shows again.
 * Returns false if they had already answered — which is what will stop a repeated
 * Discord ping once that's wired up.
 */
export async function recordMembershipPrompt(prompt: {
  authUserId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
  response: MembershipPrompt["response"]
}): Promise<boolean> {
  const inserted = await db
    .insert(membershipPrompts)
    .values(prompt)
    .onConflictDoNothing()
    .returning()

  return inserted.length > 0
}

// --- Membership requests, for the admin page ------------------------------------

export type PendingMembershipRequest = {
  authUserId: string
  email: string
  fullName: string | null
  requestedAt: Date
}

/**
 * Requests still waiting on a decision: asked to join, not turned down, and not already a
 * member. Approving creates a members row, which drops them from this list — so there's
 * no "handled" flag to keep in step.
 */
export async function findPendingMembershipRequests(): Promise<
  PendingMembershipRequest[]
> {
  const rows = await db
    .select({
      authUserId: membershipPrompts.authUserId,
      email: membershipPrompts.email,
      fullName: membershipPrompts.fullName,
      requestedAt: membershipPrompts.respondedAt,
    })
    .from(membershipPrompts)
    .where(
      and(
        eq(membershipPrompts.response, "requested"),
        isNull(membershipPrompts.deniedAt),
        sql`not exists (
          select 1 from ${members}
          where ${members.authUserId} = ${membershipPrompts.authUserId}
        )`,
      ),
    )

  // The name isn't in our table for a guest — it lives in Supabase's auth schema.
  const namesByAuthUserId = new Map<string, string | null>()

  if (rows.length > 0) {
    const authUsers = await db.execute<{
      id: string
      full_name: string | null
    }>(sql`
      select id, raw_user_meta_data->>'full_name' as full_name
      from auth.users
      where id in (${sql.join(
        rows.map((row) => sql`${row.authUserId}::uuid`),
        sql`, `,
      )})`)

    for (const authUser of authUsers) {
      namesByAuthUserId.set(authUser.id, authUser.full_name)
    }
  }

  return rows.map((row) => ({
    ...row,
    fullName: row.fullName ?? namesByAuthUserId.get(row.authUserId) ?? null,
  }))
}

/** Creates the member row and grants the base role. Returns false if already a member. */
export async function approveMembershipRequest(
  authUserId: string,
): Promise<boolean> {
  const [request] = await db
    .select()
    .from(membershipPrompts)
    .where(eq(membershipPrompts.authUserId, authUserId))
    .limit(1)

  if (!request) return false

  const [created] = await db
    .insert(members)
    .values({
      authUserId,
      email: request.email,
      fullName: memberNameFrom(request.fullName, request.email),
      // Google's picture, captured with the request. Without it every new member starts
      // as initials on a grey circle.
      avatarUrl: request.avatarUrl,
      status: "active",
      joinedAssociationAt: new Date(),
    })
    .onConflictDoNothing()
    .returning()

  if (!created) return false

  await db
    .insert(memberRoles)
    .values({ memberId: created.id, role: "member" })
    .onConflictDoNothing()

  return true
}

export async function denyMembershipRequest(authUserId: string): Promise<void> {
  await db
    .update(membershipPrompts)
    .set({ deniedAt: new Date() })
    .where(eq(membershipPrompts.authUserId, authUserId))
}

// --- Members, for the admin page ------------------------------------------------

export type MemberWithRoles = Member & { roles: Role[] }

export async function findAllMembersWithRoles(): Promise<MemberWithRoles[]> {
  const allMembers = await db.select().from(members).orderBy(members.fullName)

  if (allMembers.length === 0) return []

  const allRoles = await db.select().from(memberRoles)

  return allMembers.map((member) => ({
    ...member,
    roles: allRoles
      .filter((row) => row.memberId === member.id)
      .map((row) => row.role),
  }))
}

/**
 * Deactivating rather than deleting: the row keeps their name on past events, and losing
 * that would silently rewrite the association's history.
 */
export async function setMemberStatus(
  memberId: string,
  status: Member["status"],
): Promise<void> {
  await db
    .update(members)
    .set({ status, updatedAt: new Date() })
    .where(eq(members.id, memberId))
}

// --- Badges and titles ---------------------------------------------------------

export async function findBadgesForMember(
  memberId: string,
): Promise<MemberBadge[]> {
  return db
    .select()
    .from(memberBadges)
    .where(eq(memberBadges.memberId, memberId))
    .orderBy(asc(memberBadges.awardedAt))
}

/** Every member's badges in one query, for the admin page. */
export async function findBadgesByMember(): Promise<
  Map<string, MemberBadge[]>
> {
  const rows = await db.select().from(memberBadges)

  const byMember = new Map<string, MemberBadge[]>()
  for (const row of rows) {
    byMember.set(row.memberId, [...(byMember.get(row.memberId) ?? []), row])
  }

  return byMember
}

export async function awardBadge(award: {
  memberId: string
  badge: string
  awardedByMemberId: string
}): Promise<void> {
  // Awarding twice is the same row, so this is idempotent.
  await db.insert(memberBadges).values(award).onConflictDoNothing()
}

export async function removeBadge(
  memberId: string,
  badge: string,
): Promise<void> {
  await db
    .delete(memberBadges)
    .where(
      and(eq(memberBadges.memberId, memberId), eq(memberBadges.badge, badge)),
    )
}

/** Null clears the office. Validated against MEMBER_TITLES by the action. */
export async function setMemberTitle(
  memberId: string,
  officialTitle: string | null,
): Promise<void> {
  await db
    .update(members)
    .set({ officialTitle, updatedAt: new Date() })
    .where(eq(members.id, memberId))
}

/**
 * Fills in what Google knows and we do not, on every sign-in.
 *
 * Only gaps: a name is replaced when it is still the address or the part before it, never
 * when the member has chosen one, and a picture only when there is none. Existing members
 * predate the capture at request time, so this is what backfills them.
 */
export async function fillMemberGapsFromGoogle(
  authUserId: string,
  google: { name: string | null; avatarUrl: string | null },
): Promise<void> {
  const [member] = await db
    .select()
    .from(members)
    .where(eq(members.authUserId, authUserId))
    .limit(1)

  if (!member) return

  const hasChosenName =
    member.fullName !== member.email &&
    member.fullName !== member.email.split("@")[0]

  const fullName =
    !hasChosenName && google.name?.trim() ? google.name.trim() : undefined
  const avatarUrl =
    member.avatarUrl === null && google.avatarUrl ? google.avatarUrl : undefined

  if (fullName === undefined && avatarUrl === undefined) return

  await db
    .update(members)
    .set({
      ...(fullName === undefined ? {} : { fullName }),
      ...(avatarUrl === undefined ? {} : { avatarUrl }),
      updatedAt: new Date(),
    })
    .where(eq(members.id, member.id))
}

// --- Birthdays -----------------------------------------------------------------

export type BirthdayMember = {
  id: string
  fullName: string
  nickname: string | null
}

/**
 * Active members whose birthday falls on this month and day and who have not been
 * greeted yet this year.
 *
 * The month and day are compared in SQL against the stored date, so a birthday never
 * drifts across a timezone. The year guard is what makes the sweep safe to run twice.
 */
export async function findMembersToGreet(
  month: number,
  day: number,
  year: number,
): Promise<BirthdayMember[]> {
  return db
    .select({
      id: members.id,
      fullName: members.fullName,
      nickname: members.nickname,
    })
    .from(members)
    .where(
      and(
        eq(members.status, "active"),
        sql`extract(month from ${members.birthday}) = ${month}`,
        sql`extract(day from ${members.birthday}) = ${day}`,
        or(
          isNull(members.lastBirthdayGreetingYear),
          sql`${members.lastBirthdayGreetingYear} < ${year}`,
        ),
      ),
    )
}

export async function markBirthdayGreeted(
  memberId: string,
  year: number,
): Promise<void> {
  await db
    .update(members)
    .set({ lastBirthdayGreetingYear: year })
    .where(eq(members.id, memberId))
}

/** Everyone with a birthday, for the calendar. */
export async function findMembersWithBirthdays(): Promise<
  {
    id: string
    fullName: string
    nickname: string | null
    avatarUrl: string | null
    birthday: string
  }[]
> {
  const rows = await db
    .select({
      id: members.id,
      fullName: members.fullName,
      nickname: members.nickname,
      avatarUrl: members.avatarUrl,
      birthday: members.birthday,
    })
    .from(members)
    .where(and(eq(members.status, "active"), isNotNull(members.birthday)))

  return rows.filter(
    (row): row is (typeof rows)[number] & { birthday: string } =>
      row.birthday !== null,
  )
}
