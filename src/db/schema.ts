// The single definition of the database schema.
// Edit this, then `pnpm db:generate` and `pnpm db:migrate`. Never change tables in the
// Supabase dashboard — see CLAUDE.md.

import {
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

  // Display labels only — these grant nothing. Permissions live in memberRoles.
  officialTitle: text("official_title"),
  funTitle: text("fun_title"),

  bio: text("bio"),

  // Date, not timestamp: a birthday must not shift a day across timezones.
  birthday: date("birthday"),

  // Inactive by default so an accidental insert grants nothing.
  status: memberStatusEnum("status").notNull().default("inactive"),

  joinedAssociationAt: timestamp("joined_association_at", {
    withTimezone: true,
  }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

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
  response: membershipPromptResponseEnum("response").notNull(),
  respondedAt: timestamp("responded_at", { withTimezone: true })
    .notNull()
    .defaultNow(),

  // Set when an admin turns the request down. Approval needs no marker — the members row
  // it creates is the record.
  deniedAt: timestamp("denied_at", { withTimezone: true }),
})

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
)

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
  discordAnnouncedAt: timestamp("discord_announced_at", { withTimezone: true }),
  // Lets a later edit update that message instead of posting a correction.
  discordMessageId: text("discord_message_id"),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

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
)

// --- Date poll -----------------------------------------------------------------

// Candidate dates for an event. A confirmed event may still poll — that reads as
// "we might move this".
export const eventDateOptions = pgTable("event_date_options", {
  id: uuid("id").primaryKey().defaultRandom(),
  eventId: uuid("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
})

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
)

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
)

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
})

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
