// The database client. Per CLAUDE.md, only features/*/queries.ts may import this —
// pages and components call feature functions instead.

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

// prepare: false is required by Supabase's transaction pooler. It hands each statement
// whichever connection is free, so prepared statements don't survive between calls.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
