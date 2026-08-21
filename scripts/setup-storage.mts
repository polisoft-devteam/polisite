/**
 * Creates the Supabase Storage buckets. Safe to re-run.
 *
 *   pnpm storage:setup
 *
 * Buckets rather than dashboard clicks so the setup is visible in the repo — the same
 * reason schema goes through migrations.
 */

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !secretKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env.local",
  )
  process.exit(1)
}

const supabase = createClient(supabaseUrl, secretKey)

const MEGABYTE = 1024 * 1024

const buckets = [
  { id: "avatars", fileSizeLimit: 2 * MEGABYTE },
  { id: "event-images", fileSizeLimit: 8 * MEGABYTE },
]

for (const bucket of buckets) {
  const { error } = await supabase.storage.createBucket(bucket.id, {
    // Public read. Uploads still go through a server action that checks membership;
    // files are named with a uuid so URLs aren't guessable. See lib/storage.ts.
    public: true,
    fileSizeLimit: bucket.fileSizeLimit,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  })

  if (error && !error.message.toLowerCase().includes("already exists")) {
    console.error(`Failed to create "${bucket.id}":`, error.message)
    process.exit(1)
  }

  console.log(
    `${bucket.id}: ${error ? "already existed" : "created"} (max ${bucket.fileSizeLimit / MEGABYTE} MB)`,
  )
}

process.exit(0)
