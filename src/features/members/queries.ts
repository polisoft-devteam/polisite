// Database access for members. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { memberRoles, members, type Member, type Role } from "@/db/schema"

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

type GoogleProfile = {
  authUserId: string
  email: string
  fullName: string | null
  avatarUrl: string | null
}

/**
 * Called after every successful sign-in.
 *
 * Anyone with a Google account may sign in, and everyone starts as "guest" — which sees
 * exactly what a signed-out visitor sees. Access is granted afterwards by promoting them
 * to "active". Google authenticates; we authorize.
 */
export async function ensureMemberForSignIn(
  profile: GoogleProfile,
): Promise<Member> {
  const existing = await findMemberByAuthUserId(profile.authUserId)
  if (existing) return existing

  const [member] = await db
    .insert(members)
    .values({
      authUserId: profile.authUserId,
      email: profile.email,
      fullName: profile.fullName ?? profile.email,
      avatarUrl: profile.avatarUrl,
      status: "guest",
    })
    // Covers a row added by hand with this email before they ever signed in: link it
    // rather than failing on the unique constraint. Their own edits are left alone.
    .onConflictDoUpdate({
      target: members.email,
      set: { authUserId: profile.authUserId, updatedAt: new Date() },
    })
    .returning()

  return member
}
