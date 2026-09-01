CREATE TABLE "wishlist_claims" (
	"item_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "wishlist_claims_item_id_member_id_pk" PRIMARY KEY("item_id","member_id")
);
--> statement-breakpoint
ALTER TABLE "wishlist_claims" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "wishlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "wishlist_items" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "members" ADD COLUMN "github_url" text;--> statement-breakpoint
ALTER TABLE "wishlist_claims" ADD CONSTRAINT "wishlist_claims_item_id_wishlist_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."wishlist_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_claims" ADD CONSTRAINT "wishlist_claims_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;