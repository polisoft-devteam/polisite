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
