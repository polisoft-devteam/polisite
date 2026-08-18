/**
 * Promotes a guest to a member, or changes their status and roles.
 *
 * Everyone who signs in with Google gets a "guest" row automatically. This is how you
 * grant them access afterwards.
 *
 *   pnpm member anna@example.com --status active
 *   pnpm member victor@example.com --status active --role admin --role board
 *   pnpm member someone@example.com --status inactive
 *
 * They must have signed in at least once — there's nothing to promote otherwise.
 */

import { eq } from "drizzle-orm"

import { db } from "../src/db/index"
import {
  memberRoles,
  members,
  memberStatusEnum,
  roleEnum,
} from "../src/db/schema"

type RoleName = (typeof roleEnum.enumValues)[number]
type StatusName = (typeof memberStatusEnum.enumValues)[number]

const args = process.argv.slice(2)
const email = args[0]

if (!email || email.startsWith("--") || !email.includes("@")) {
  console.error(
    "Usage: pnpm member <email> [--status guest|active|inactive] [--role admin]",
  )
  process.exit(1)
}

function readOption(flag: string): string | undefined {
  const index = args.indexOf(flag)
  return index === -1 ? undefined : args[index + 1]
}

function readRepeatedOption(flag: string): string[] {
  return args
    .map((value, index) => (value === flag ? args[index + 1] : undefined))
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

const [existing] = await db
  .select()
  .from(members)
  .where(eq(members.email, email))
  .limit(1)

if (!existing) {
  console.error(`No member with email "${email}".`)
  console.error(
    "They need to sign in with Google once before you can promote them.",
  )
  process.exit(1)
}

const [member] = await db
  .update(members)
  .set({
    status,
    // Only set on the way in, so it survives someone being made inactive and back again.
    memberSince:
      existing.memberSince ?? (status === "active" ? new Date() : null),
    updatedAt: new Date(),
  })
  .where(eq(members.id, existing.id))
  .returning()

// Everyone active is a member; extra roles are added on top.
const rolesToGrant: RoleName[] =
  status === "active"
    ? [...new Set<RoleName>(["member", ...requestedRoles])]
    : requestedRoles

for (const role of rolesToGrant) {
  await db
    .insert(memberRoles)
    .values({ memberId: member.id, role })
    .onConflictDoNothing()
}

console.log(`Updated ${member.email}`)
console.log(`  status: ${member.status}`)
console.log(`  roles:  ${rolesToGrant.join(", ") || "none granted"}`)

process.exit(0)
