CREATE TABLE "member_badges" (
	"member_id" uuid NOT NULL,
	"badge" text NOT NULL,
	"awarded_at" timestamp with time zone DEFAULT now() NOT NULL,
	"awarded_by_member_id" uuid,
	CONSTRAINT "member_badges_member_id_badge_pk" PRIMARY KEY("member_id","badge")
);
--> statement-breakpoint
ALTER TABLE "member_badges" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "membership_prompts" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_badges" ADD CONSTRAINT "member_badges_awarded_by_member_id_members_id_fk" FOREIGN KEY ("awarded_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" DROP COLUMN "fun_title";