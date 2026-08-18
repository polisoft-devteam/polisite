// Database access for members. Per CLAUDE.md this is one of the only places allowed to
// import src/db — pages and components call these functions instead.

import { eq } from "drizzle-orm"

import { db } from "@/db"
import { members, type Member } from "@/db/schema"

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
