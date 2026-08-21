// Database access for members. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.

import { eq } from "drizzle-orm"

import { db } from "@/db"
import {
  memberRoles,
  members,
  membershipPrompts,
  type Member,
  type MembershipPrompt,
  type Role,
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
  officialTitle: string | null
  funTitle: string | null
  bio: string | null
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
  response: MembershipPrompt["response"]
}): Promise<boolean> {
  const inserted = await db
    .insert(membershipPrompts)
    .values(prompt)
    .onConflictDoNothing()
    .returning()

  return inserted.length > 0
}
