-- In three steps: a NOT NULL column added in one statement fails on a table with rows.
-- Duels created before this get a week from when they started.
ALTER TABLE "competitions" ADD COLUMN "ends_at" timestamp with time zone;--> statement-breakpoint
UPDATE "competitions" SET "ends_at" = "created_at" + interval '7 days';--> statement-breakpoint
ALTER TABLE "competitions" ALTER COLUMN "ends_at" SET NOT NULL;
