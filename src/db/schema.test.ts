// Supabase serves the whole `public` schema over PostgREST to anyone holding the
// publishable key, and that key ships in every browser. A table without RLS is therefore
// readable and writable by the public internet — which is exactly what happened here
// before migration 0014.
//
// The app connects as `postgres`, which has BYPASSRLS, so it keeps working either way and
// nothing in the app would fail if a new table were left open. That is what makes this
// worth a test rather than a code review habit.

import { describe, expect, it } from "vitest"
import { getTableConfig, PgTable } from "drizzle-orm/pg-core"

import * as schema from "@/db/schema"

// `.enableRLS()` returns an Omit<> of the table type, so the exports are narrowed at
// runtime rather than by their declared types.
const tables: [string, PgTable][] = Object.entries(schema)
  .filter(([, value]) => value instanceof PgTable)
  .map(([name, value]) => [name, value as PgTable])

describe("every table is locked down", () => {
  it("finds the tables to check", () => {
    expect(tables.length).toBeGreaterThan(0)
  })

  it.each(tables)("%s has RLS enabled", (_name, table) => {
    expect(getTableConfig(table).enableRLS).toBe(true)
  })

  // Access rules live in permissions.ts. A policy here would mean the answer to
  // "who can see this?" is split across two languages.
  it.each(tables)("%s has no RLS policies", (_name, table) => {
    expect(getTableConfig(table).policies).toEqual([])
  })
})
