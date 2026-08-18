CREATE TYPE "public"."role" AS ENUM('member', 'moderator', 'board', 'treasurer', 'admin');--> statement-breakpoint
CREATE TABLE "member_roles" (
	"member_id" uuid NOT NULL,
	"role" "role" NOT NULL,
	"granted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "member_roles_member_id_role_pk" PRIMARY KEY("member_id","role")
);
--> statement-breakpoint
ALTER TABLE "member_roles" ADD CONSTRAINT "member_roles_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;