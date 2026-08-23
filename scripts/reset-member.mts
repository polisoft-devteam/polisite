/**
 * Removes every trace of someone, so signing in with that Google account starts fresh.
 *
 *   pnpm member:reset someone@example.com
 *
 * Deletes their members row (cascading roles, RSVPs and date votes), their answer to the
 * welcome prompt, and their Supabase auth user. Nothing is kept.
 *
 * Refuses to touch an admin — that guard is there so a typo can't delete your own account.
 */

import { createClient } from "@supabase/supabase-js"
import { eq } from "drizzle-orm"

import { db } from "../src/db/index"
import { memberRoles, members, membershipPrompts } from "../src/db/schema"

const email = process.argv[2]

if (!email || !email.includes("@")) {
  console.error("Usage: pnpm member:reset <email>")
  process.exit(1)
}

const [member] = await db
  .select()
  .from(members)
  .where(eq(members.email, email))
  .limit(1)

if (member) {
  const roles = await db
    .select({ role: memberRoles.role })
    .from(memberRoles)
    .where(eq(memberRoles.memberId, member.id))

  if (roles.some((row) => row.role === "admin")) {
    console.error(
      `"${email}" is an admin. Refusing — remove the role first if you mean it.`,
    )
    process.exit(1)
  }
}

console.log(`Resetting ${email}`)

const [prompt] = await db
  .select()
  .from(membershipPrompts)
  .where(eq(membershipPrompts.email, email))
  .limit(1)

console.log(`  members row:    ${member ? "found" : "none"}`)
console.log(`  welcome prompt: ${prompt ? prompt.response : "none"}`)

if (member) {
  // Events reference their creator without a cascade, so this fails loudly rather than
  // silently orphaning an event.
  await db.delete(members).where(eq(members.id, member.id))
  console.log("  deleted members row (roles, RSVPs and votes cascaded)")
}

if (prompt) {
  await db.delete(membershipPrompts).where(eq(membershipPrompts.email, email))
  console.log("  deleted welcome prompt answer")
}

const authUserId = member?.authUserId ?? prompt?.authUserId

if (authUserId) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )

  const { error } = await supabase.auth.admin.deleteUser(authUserId)

  console.log(
    error
      ? `  auth user NOT deleted: ${error.message}`
      : "  deleted Supabase auth user",
  )
} else {
  console.log(
    "  no auth user id on record — nothing to delete in Supabase Auth",
  )
}

console.log("Done. Signing in with that account will start from scratch.")

process.exit(0)
