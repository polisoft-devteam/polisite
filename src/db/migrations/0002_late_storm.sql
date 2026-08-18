ALTER TABLE "members" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'guest'::text;--> statement-breakpoint
DROP TYPE "public"."member_status";--> statement-breakpoint
CREATE TYPE "public"."member_status" AS ENUM('guest', 'active', 'inactive');--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DEFAULT 'guest'::"public"."member_status";--> statement-breakpoint
ALTER TABLE "members" ALTER COLUMN "status" SET DATA TYPE "public"."member_status" USING "status"::"public"."member_status";