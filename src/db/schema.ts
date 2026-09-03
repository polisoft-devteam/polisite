// The single definition of the database schema.
// Edit this, then `pnpm db:generate` and `pnpm db:migrate`. Never change tables in the
// Supabase dashboard — see CLAUDE.md.
//
// Every table ends in `.enableRLS()` and has no policies, which is a lock rather than a
// permission system. Supabase serves the whole `public` schema over PostgREST to anyone
// holding the publishable key — and that key ships in every browser, so without this the
// tables are readable and writable by the public internet. RLS with no policies denies
// that door entirely, while the app is unaffected because it connects as `postgres`,
// which has BYPASSRLS.
//
// A new table without `.enableRLS()` is public the moment it is migrated. Add it.

import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

// --- Members -------------------------------------------------------------------

// A row here means "in the association". Guests have no row at all.
// Inactive members keep their row so their event history stays intact.
export const memberStatusEnum = pgEnum("member_status", ["active", "inactive"])

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Not a foreign key: auth.users belongs to a Supabase schema our migrations don't manage.
  authUserId: uuid("auth_user_id").unique(),

  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),

  nickname: text("nickname"),

  // A display label only, and it grants nothing: permissions live in memberRoles. Given
  // by an admin rather than chosen, and the list of allowed values lives in
  // features/members/titles.ts so adding one needs no migration.
  officialTitle: text("official_title"),

  bio: text("bio"),

  githubUrl: text("github_url"),

  // Which of their badges to show under their name in lists. A key from BADGES, and only
  // meaningful if they actually hold it, which the query checks rather than the column.
  displayedBadge: text("displayed_badge"),

  // Date, not timestamp: a birthday must not shift a day across timezones.
  birthday: date("birthday"),

  // The year we last wished them happy birthday, so the daily sweep cannot greet the same
  // person twice if it runs again. Cheaper than a table of greetings for one line a year.
  lastBirthdayGreetingYear: integer("last_birthday_greeting_year"),

  // Inactive by default so an accidental insert grants nothing.
  status: memberStatusEnum("status").notNull().default("inactive"),

  joinedAssociationAt: timestamp("joined_association_at", {
    withTimezone: true,
  }),

  // Everything newer than this counts as a notification. One timestamp rather than a row
  // per notification: the counts are all derivable from tables we already keep, and a
  // notifications table would be a second copy of the truth to keep in step.
  notificationsSeenAt: timestamp("notifications_seen_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS()

// --- Membership prompt ---------------------------------------------------------

export const membershipPromptResponseEnum = pgEnum(
  "membership_prompt_response",
  ["requested", "dismissed"],
)

// One row per signed-in non-member who has answered the welcome prompt, so it never
// appears twice. Keyed on the auth user, which also makes a duplicate request impossible.
export const membershipPrompts = pgTable("membership_prompts", {
  authUserId: uuid("auth_user_id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  response: membershipPromptResponseEnum("response").notNull(),
  respondedAt: timestamp("responded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Set when an admin turns the request down. Approval needs no marker — the members row
  // it creates is the record.
  deniedAt: timestamp("denied_at", { withTimezone: true }),
}).enableRLS()

// --- Roles ---------------------------------------------------------------------

// Rows rather than a column, because one member can hold several.
// Only two for now — add a role when a real rule needs one.
export const roleEnum = pgEnum("role", ["member", "admin"])

export const memberRoles = pgTable(
  "member_roles",
  {
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.memberId, table.role] })],
).enableRLS()

// --- Events --------------------------------------------------------------------

// Who may attend, and who may see it. Always filtered in the query, never by hiding UI.
//
// "public"             = open event, usually hosted by someone else. Guests see it.
// "members"            = closed, us for us. Members only.
// "members_and_friends" = members may bring friends and family. Members only see it.
export const eventVisibilityEnum = pgEnum("event_visibility", [
  "public",
  "members",
  "members_and_friends",
])

export const eventKindEnum = pgEnum("event_kind", ["suggestion", "confirmed"])

export const eventCategoryEnum = pgEnum("event_category", [
  "music",
  "party",
  "trip",
  "hike",
  "sport",
  "gaming",
  "food",
  "board_meeting",
  "birthday",
  "other",
])

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Frozen when the event is created, so a link already posted to Discord keeps working
  // even if the title changes. See lib/slug.ts.
  slug: text("slug").notNull().unique(),

  title: text("title").notNull(),
  description: text("description"),

  kind: eventKindEnum("kind").notNull().default("suggestion"),

  // Null while a suggestion has no date yet — its candidate dates live in
  // eventDateOptions. A confirmed event always has one.
  // The instant is UTC; timeZone is where the event physically happens, so a London
  // concert reads 19:00 to everyone rather than 20:00 to the Swedes.
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  timeZone: text("time_zone").notNull().default("Europe/Stockholm"),

  location: text("location"),

  // Happens online rather than at an address. The location input is disabled when this is
  // set, so the two can't disagree about where the event is.
  isOnline: boolean("is_online").notNull().default(false),
  category: eventCategoryEnum("category").notNull().default("other"),

  // Null means free. Minor units (öre, pence) so there is no rounding to argue about.
  priceMinorUnits: integer("price_minor_units"),
  priceCurrency: text("price_currency").notNull().default("SEK"),

  // Null means unlimited.
  maxAttendees: integer("max_attendees"),

  imageUrl: text("image_url"),
  // Where to buy tickets or read the official page.
  eventUrl: text("event_url"),
  // Anything supporting: a trailer, a route map, a playlist.
  extraLinkUrl: text("extra_link_url"),

  visibility: eventVisibilityEnum("visibility").notNull().default("members"),

  createdByMemberId: uuid("created_by_member_id")
    .notNull()
    .references(() => members.id),

  // Set once the announcement is posted, so it can't be sent twice.
  // Set rather than deleted: an event people answered is part of the association's
  // history, and "it was called off" is different information from "it never existed".
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),

  discordAnnouncedAt: timestamp("discord_announced_at", { withTimezone: true }),
  // Lets a later edit update that message instead of posting a correction.
  discordMessageId: text("discord_message_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS()

// --- Discord reminders ---------------------------------------------------------

export const reminderOffsetEnum = pgEnum("reminder_offset", [
  "day_before",
  "week_before",
  "four_weeks_before",
  "four_months_before",
])

// One row per ping the creator asked for. The composite key makes double-sending
// impossible rather than something the scheduled job has to remember.
export const eventReminders = pgTable(
  "event_reminders",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    offset: reminderOffsetEnum("offset").notNull(),

    // Null until the job posts it.
    sentAt: timestamp("sent_at", { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.eventId, table.offset] })],
).enableRLS()

// --- Date poll -----------------------------------------------------------------

// Candidate dates for an event. A confirmed event may still poll — that reads as
// "we might move this".
export const eventDateOptions = pgTable("event_date_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
}).enableRLS()

// A member may vote for several dates but not twice for the same one, which the composite
// key enforces rather than the code having to remember.
export const eventDateVotes = pgTable(
  "event_date_votes",
  {
    dateOptionId: uuid("date_option_id")
      .notNull()
      .references(() => eventDateOptions.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),
    votedAt: timestamp("voted_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.dateOptionId, table.memberId] })],
).enableRLS()

export const attendanceResponseEnum = pgEnum("attendance_response", [
  "going",
  "interested",
  "not_going",
])

export const eventAttendees = pgTable(
  "event_attendees",
  {
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    response: attendanceResponseEnum("response").notNull(),

    respondedAt: timestamp("responded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // One answer per member per event; changing your mind updates the row.
  (table) => [primaryKey({ columns: [table.eventId, table.memberId] })],
).enableRLS()

// Friends and family brought along by a member. A name and nothing else — they have no
// account, and we have no consent to store anything more about someone who isn't here.
export const eventGuests = pgTable("event_guests", {
  id: uuid("id").primaryKey().defaultRandom(),

  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),

  // Who brought them, so only that member (or an admin) can take them off again.
  invitedByMemberId: uuid("invited_by_member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  name: text("name").notNull(),

  addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
}).enableRLS()

// --- Badges --------------------------------------------------------------------
//
// Scout patches: an admin hands one out, and it shows on the member's profile. Which
// badges exist is defined in features/members/badges.ts rather than here, because a badge
// is a name, an icon and a sentence of copy, none of which the database needs to know and
// all of which would otherwise need a migration to add. This table only records who has
// what.

export const memberBadges = pgTable(
  "member_badges",
  {
    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    /** A key from BADGES. Text rather than an enum so a new badge needs no migration. */
    badge: text("badge").notNull(),

    /** Which rung of a badge that counts up, such as Years of Service. Null if it has
        no rungs. Raised in place, so a member holds one row, at their highest. */
    tier: integer("tier"),

    awardedAt: timestamp("awarded_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    /** Who handed it out. Null when it was earned rather than given. */
    awardedByMemberId: uuid("awarded_by_member_id").references(
      () => members.id,
      { onDelete: "set null" },
    ),
  },
  // One of each per member; awarding twice is the same row.
  (table) => [primaryKey({ columns: [table.memberId, table.badge] })],
).enableRLS()

// --- The open archive ----------------------------------------------------------
//
// Albums, films, playlists and plain links, in one table rather than four, because they
// differ only in what a URL turns out to be. The kind is worked out from the URL when it
// is added; see features/archive/detect.ts.
//
// Members only, whatever is in here. A Google album shared "anyone with the link" has its
// URL as its permission, so the row must never reach a guest's page.

export const archiveLinkKindEnum = pgEnum("archive_link_kind", [
  "album",
  "film",
  "playlist",
  "resource",
])

export const archiveLinks = pgTable("archive_links", {
  id: uuid("id").primaryKey().defaultRandom(),

  kind: archiveLinkKindEnum("kind").notNull(),
  label: text("label").notNull(),
  url: text("url").notNull(),

  /** The video or playlist id, for the kinds that embed. Null for the rest. */
  externalId: text("external_id"),

  /** Albums split into the main run and the gaming ones; null for everything else. */
  albumGroup: text("album_group"),

  /** Google's own album cover, or our thumbnail for a film. Optional throughout. */
  coverUrl: text("cover_url"),

  /** As the source reports it, so it is shown rather than formatted. */
  caption: text("caption"),

  /** Newest first within a kind, and hand-set when the order matters. */
  sortOrder: integer("sort_order").notNull().default(0),

  addedByMemberId: uuid("added_by_member_id").references(() => members.id, {
    onDelete: "set null",
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS()

// --- Wishlist ------------------------------------------------------------------
//
// A member lists things they want; everyone else can claim one, or join a claim someone
// already made so a bigger present can be shared.
//
// The owner must never learn anything about the claims on their own wishes, not who
// claimed and not that anything was claimed at all. That is enforced in the queries, which
// leave the claim rows out entirely when the viewer is the owner. Nothing here can express
// it, so a new query that joins these two tables has to think about it again.

export const wishlistItems = pgTable("wishlist_items", {
  id: uuid("id").primaryKey().defaultRandom(),

  memberId: uuid("member_id")
    .notNull()
    .references(() => members.id, { onDelete: "cascade" }),

  title: text("title").notNull(),

  // Required: a wish nobody can find in a shop is not much of a wish.
  url: text("url").notNull(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}).enableRLS()

export const wishlistClaims = pgTable(
  "wishlist_claims",
  {
    itemId: uuid("item_id")
      .notNull()
      .references(() => wishlistItems.id, { onDelete: "cascade" }),

    memberId: uuid("member_id")
      .notNull()
      .references(() => members.id, { onDelete: "cascade" }),

    claimedAt: timestamp("claimed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  // One row per member per wish, so joining a claim twice is not a thing.
  (table) => [primaryKey({ columns: [table.itemId, table.memberId] })],
).enableRLS()

// --- Types ---------------------------------------------------------------------

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type Role = (typeof roleEnum.enumValues)[number]
export type EventVisibility = (typeof eventVisibilityEnum.enumValues)[number]
export type EventCategory = (typeof eventCategoryEnum.enumValues)[number]
export type EventKind = (typeof eventKindEnum.enumValues)[number]
export type EventDateOption = typeof eventDateOptions.$inferSelect
export type ReminderOffset = (typeof reminderOffsetEnum.enumValues)[number]
export type EventReminder = typeof eventReminders.$inferSelect
export type MembershipPrompt = typeof membershipPrompts.$inferSelect
export type AttendanceResponse =
  (typeof attendanceResponseEnum.enumValues)[number]
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAttendee = typeof eventAttendees.$inferSelect
export type EventGuest = typeof eventGuests.$inferSelect
export type WishlistItem = typeof wishlistItems.$inferSelect
export type WishlistClaim = typeof wishlistClaims.$inferSelect
export type MemberBadge = typeof memberBadges.$inferSelect

export type ArchiveLink = typeof archiveLinks.$inferSelect
export type ArchiveLinkKind = (typeof archiveLinkKindEnum.enumValues)[number]
