/**
 * Says whether the database answers, and what it says if it doesn't.
 *
 *   pnpm db:ping
 *   DATABASE_URL="postgresql://…" pnpm db:ping   # to test a URL you have not saved
 *
 * Written for the afternoon a rotated password left the site returning 500 on every page
 * that touched Postgres: the app's own error was four frames of Drizzle stack around one
 * useful sentence, and knowing whether the credentials work is a question worth asking on
 * its own.
 */

import { sql } from "drizzle-orm"

import { db } from "../src/db/index"

try {
  const rows = await db.execute(sql`select current_user, version() as version`)

  console.log("Connected.", JSON.stringify(rows[0]))
} catch (error) {
  const cause = (error as { cause?: Error }).cause

  console.error("No answer.")
  console.error((cause ?? (error as Error)).message)
  console.error(
    "\npassword authentication failed → the password in this URL is stale" +
      "\nTenant or user not found     → wrong project ref in the URL" +
      "\nECIRCUITBREAKER             → Supabase is blocking new connections after repeated" +
      "\n                              failures. Fix whatever is retrying with the old" +
      "\n                              password, then wait a few minutes." +
      "\nENOTFOUND / ETIMEDOUT       → wrong host, usually the IPv6-only direct one instead" +
      "\n                              of the pooler",
  )

  process.exitCode = 1
}

process.exit()
