-- Added nullable, backfilled, then made NOT NULL: the generated single-statement version
-- fails on any table that already has rows.
--
-- The backfill mirrors lib/slug.ts closely enough for existing rows. New slugs are built
-- in TypeScript, so this SQL never runs again.

ALTER TABLE "events" ADD COLUMN "slug" text;--> statement-breakpoint

UPDATE "events"
SET "slug" =
  coalesce(
    nullif(
      trim(both '-' from
        regexp_replace(
          translate(lower("title"), 'åäöéèü', 'aaoeeu'),
          '[^a-z0-9]+', '-', 'g'
        )
      ),
      ''
    ),
    'event'
  )
  -- The date in the event's own timezone, so it matches what the page shows.
  || coalesce('-' || to_char("starts_at" AT TIME ZONE "time_zone", 'YYYY-MM-DD'), '')
WHERE "slug" IS NULL;--> statement-breakpoint

ALTER TABLE "events" ALTER COLUMN "slug" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_slug_unique" UNIQUE("slug");
