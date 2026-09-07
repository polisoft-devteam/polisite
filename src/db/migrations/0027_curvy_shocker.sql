CREATE TABLE "election_picks" (
	"member_id" uuid PRIMARY KEY NOT NULL,
	"party_key" text NOT NULL,
	"spun_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "election_picks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "election_picks" ADD CONSTRAINT "election_picks_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;