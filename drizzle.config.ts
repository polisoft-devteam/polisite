import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

// drizzle-kit runs outside Next.js, so it doesn't load .env.local on its own.
config({ path: ".env.local" })

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  // Migrations use the session pooler — the transaction pooler can't run schema changes.
  dbCredentials: { url: process.env.DIRECT_URL! },
  // Supabase owns auth, storage and the other internal schemas. We only manage "public",
  // and without this filter drizzle-kit would try to drop tables it doesn't own.
  schemaFilter: ["public"],
})
