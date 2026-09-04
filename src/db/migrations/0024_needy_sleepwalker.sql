CREATE TYPE "public"."archive_link_kind" AS ENUM('album', 'film', 'playlist', 'resource');--> statement-breakpoint
CREATE TABLE "archive_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" "archive_link_kind" NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"external_id" text,
	"album_group" text,
	"cover_url" text,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"added_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "archive_links" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "archive_links" ADD CONSTRAINT "archive_links_added_by_member_id_members_id_fk" FOREIGN KEY ("added_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;