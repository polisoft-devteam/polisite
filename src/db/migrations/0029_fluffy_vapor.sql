CREATE TABLE "election_votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"party_key" text NOT NULL,
	"spun_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "election_votes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "election_votes" ADD CONSTRAINT "election_votes_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;