CREATE TYPE "public"."event_kind" AS ENUM('suggestion', 'confirmed');--> statement-breakpoint
CREATE TABLE "event_date_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"starts_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_date_votes" (
	"date_option_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"voted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "event_date_votes_date_option_id_member_id_pk" PRIMARY KEY("date_option_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "events" ALTER COLUMN "starts_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "kind" "event_kind" DEFAULT 'suggestion' NOT NULL;--> statement-breakpoint
ALTER TABLE "event_date_options" ADD CONSTRAINT "event_date_options_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_date_votes" ADD CONSTRAINT "event_date_votes_date_option_id_event_date_options_id_fk" FOREIGN KEY ("date_option_id") REFERENCES "public"."event_date_options"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_date_votes" ADD CONSTRAINT "event_date_votes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;