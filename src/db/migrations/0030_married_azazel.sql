CREATE TABLE "competition_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" uuid NOT NULL,
	"voter_member_id" uuid NOT NULL,
	"voted_for_member_id" uuid NOT NULL,
	"reason" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competition_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "competitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"left_member_id" uuid NOT NULL,
	"right_member_id" uuid NOT NULL,
	"left_banner_url" text,
	"right_banner_url" text,
	"created_by_member_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "competitions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "competition_votes" ADD CONSTRAINT "competition_votes_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_votes" ADD CONSTRAINT "competition_votes_voter_member_id_members_id_fk" FOREIGN KEY ("voter_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_votes" ADD CONSTRAINT "competition_votes_voted_for_member_id_members_id_fk" FOREIGN KEY ("voted_for_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_left_member_id_members_id_fk" FOREIGN KEY ("left_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_right_member_id_members_id_fk" FOREIGN KEY ("right_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_created_by_member_id_members_id_fk" FOREIGN KEY ("created_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;