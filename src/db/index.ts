// The database client. Only features/*/queries.ts may import this — see CLAUDE.md.

import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

// Supabase's transaction pooler reuses connections between statements, so prepared
// statements would not survive.
const client = postgres(process.env.DATABASE_URL!, { prepare: false })

export const db = drizzle(client, { schema })
