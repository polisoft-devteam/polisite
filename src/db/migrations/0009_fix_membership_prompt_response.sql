-- Migration 0008 guessed that requested_at had been renamed to response, so "response"
-- ended up a timestamptz instead of the enum. Inserting "requested" into it failed.
--
-- Dropping and re-adding is safe here: the column never held a usable value.

ALTER TABLE "membership_prompts" DROP COLUMN "response";--> statement-breakpoint
ALTER TABLE "membership_prompts" ADD COLUMN "response" "public"."membership_prompt_response" NOT NULL;
