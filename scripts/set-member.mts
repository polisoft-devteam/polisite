/**
 * Adds someone to the association, or changes their status and roles.
 *
 *   pnpm member anna@example.com
 *   pnpm member victor@example.com --role admin
 *   pnpm member someone@example.com --status inactive
 *
 * They must have signed in with Google at least once, so there is an account to link to.
 * Signing in stores nothing in our database — this script is what creates the member row.
 */

import { eq, sql } from "drizzle-orm"

import { db } from "../src/db/index"
import {
  memberRoles,
  members,
  memberStatusEnum,
  roleEnum,
} from "../src/db/schema"

type RoleName = (typeof roleEnum.enumValues)[number]
type StatusName = (typeof memberStatusEnum.enumValues)[number]

const commandLineArguments = process.argv.slice(2)
const email = commandLineArguments[0]

if (!email || email.startsWith("--") || !email.includes("@")) {
  console.error(
    "Usage: pnpm member <email> [--status active|inactive] [--role admin]",
  )
  process.exit(1)
}

function readOption(flag: string): string | undefined {
  const index = commandLineArguments.indexOf(flag)
  return index === -1 ? undefined : commandLineArguments[index + 1]
}

function readRepeatedOption(flag: string): string[] {
  return commandLineArguments
    .map((value, index) =>
      value === flag ? commandLineArguments[index + 1] : undefined,
    )
    .filter((value): value is string => Boolean(value))
}

const status = (readOption("--status") ?? "active") as StatusName
const requestedRoles = readRepeatedOption("--role") as RoleName[]

if (!memberStatusEnum.enumValues.includes(status)) {
  console.error(
    `Unknown status "${status}". Use one of: ${memberStatusEnum.enumValues.join(", ")}`,
  )
  process.exit(1)
}

for (const role of requestedRoles) {
  if (!roleEnum.enumValues.includes(role)) {
    console.error(
      `Unknown role "${role}". Use one of: ${roleEnum.enumValues.join(", ")}`,
    )
    process.exit(1)
  }
}

type SupabaseAuthUser = {
  id: string
  full_name: string | null
  avatar_url: string | null
}

// auth.users belongs to Supabase, so it is read with raw SQL rather than through Drizzle.
async function findSupabaseAuthUserByEmail(
  emailToFind: string,
): Promise<SupabaseAuthUser | null> {
  const rows = await db.execute<SupabaseAuthUser>(sql`
    select id,
           raw_user_meta_data->>'full_name'  as full_name,
           raw_user_meta_data->>'avatar_url' as avatar_url
    from auth.users
    where email = ${emailToFind}
    limit 1`)

  return rows[0] ?? null
}

const [existingMember] = await db
  .select()
  .from(members)
  .where(eq(members.email, email))
  .limit(1)

let memberId: string

if (existingMember) {
  const [updated] = await db
    .update(members)
    .set({
      status,
      joinedAssociationAt:
        existingMember.joinedAssociationAt ??
        (status === "active" ? new Date() : null),
      updatedAt: new Date(),
    })
    .where(eq(members.id, existingMember.id))
    .returning()

  memberId = updated.id
  console.log(`Updated ${email}`)
} else {
  const authUser = await findSupabaseAuthUserByEmail(email)

  if (!authUser) {
    console.error(`Nobody has signed in with "${email}".`)
    console.error("Ask them to sign in with Google once, then run this again.")
    process.exit(1)
  }

  const [created] = await db
    .insert(members)
    .values({
      authUserId: authUser.id,
      email,
      fullName: authUser.full_name ?? email,
      avatarUrl: authUser.avatar_url,
      status,
      joinedAssociationAt: status === "active" ? new Date() : null,
    })
    .returning()

  memberId = created.id
  console.log(`Added ${email}`)
}

// Everyone active is a member; any extra roles are added on top.
const rolesToGrant: RoleName[] =
  status === "active"
    ? [...new Set<RoleName>(["member", ...requestedRoles])]
    : requestedRoles

for (const role of rolesToGrant) {
  await db.insert(memberRoles).values({ memberId, role }).onConflictDoNothing()
}

console.log(`  status: ${status}`)
console.log(`  roles:  ${rolesToGrant.join(", ") || "none granted"}`)

process.exit(0)
