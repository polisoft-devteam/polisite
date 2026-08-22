CREATE TYPE "public"."membership_prompt_response" AS ENUM('requested', 'dismissed');--> statement-breakpoint
ALTER TABLE "membership_requests" RENAME TO "membership_prompts";--> statement-breakpoint
ALTER TABLE "membership_prompts" RENAME COLUMN "requested_at" TO "response";--> statement-breakpoint
ALTER TABLE "membership_prompts" ADD COLUMN "responded_at" timestamp with time zone DEFAULT now() NOT NULL;