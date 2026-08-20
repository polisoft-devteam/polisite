ALTER TABLE "members" RENAME COLUMN "member_since" TO "joined_association_at";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'inactive'::text;--> statement-breakpoint
DROP TYPE "public"."member_status";--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'inactive'::"public"."member_status";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DATA TYPE "public"."member_status" USING "status"::"public"."member_status";