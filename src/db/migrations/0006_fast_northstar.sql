ALTER TABLE "events" ALTER COLUMN "visibility" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "visibility" SET DEFAULT 'members'::text;--> statement-breakpoint
DROP TYPE "public"."event_visibility";--> statement-breakpoint
CREATE TYPE "public"."event_visibility" AS ENUM('public', 'members', 'members_and_friends');--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "visibility" SET DEFAULT 'members'::"public"."event_visibility";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "visibility" SET DATA TYPE "public"."event_visibility" USING "visibility"::"public"."event_visibility";