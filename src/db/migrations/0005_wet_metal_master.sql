CREATE TYPE "public"."event_category" AS ENUM('music', 'party', 'trip', 'hike', 'sport', 'food', 'board_meeting', 'birthday', 'other');--> statement-breakpoint
CREATE TYPE "public"."reminder_offset" AS ENUM('day_before', 'week_before', 'four_weeks_before', 'four_months_before');--> statement-breakpoint
CREATE TABLE "event_reminders" (
	"event_id" uuid NOT NULL,
	"offset" "reminder_offset" NOT NULL,
	"sent_at" timestamp with time zone,
	CONSTRAINT "event_reminders_event_id_offset_pk" PRIMARY KEY("event_id","offset")
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" SET DEFAULT 'other'::"public"."event_category";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" SET DATA TYPE "public"."event_category" USING "category"::"public"."event_category";--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "category" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "time_zone" text DEFAULT 'Europe/Stockholm' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "price_minor_units" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "price_currency" text DEFAULT 'SEK' NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "max_attendees" integer;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "event_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "extra_link_url" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "discord_announced_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "discord_message_id" text;--> statement-breakpoint
ALTER TABLE "event_reminders" ADD CONSTRAINT "event_reminders_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;