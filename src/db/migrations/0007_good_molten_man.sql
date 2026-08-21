CREATE TABLE "membership_requests" (
	"auth_user_id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"full_name" text,
	"requested_at" timestamp with time zone DEFAULT now() NOT NULL
);
