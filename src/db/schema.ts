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

// Always filtered in the query, never by hiding UI.
export const eventVisibilityEnum = pgEnum("event_visibility", [
  "public",
  "members",
  "private",
])

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

  title: text("title").notNull(),
  description: text("description"),

  // The instant is UTC; timeZone is where the event physically happens, so a London
  // concert reads 19:00 to everyone rather than 20:00 to the Swedes.
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
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

// --- Types ---------------------------------------------------------------------

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type Role = (typeof roleEnum.enumValues)[number]
export type EventVisibility = (typeof eventVisibilityEnum.enumValues)[number]
export type EventCategory = (typeof eventCategoryEnum.enumValues)[number]
export type ReminderOffset = (typeof reminderOffsetEnum.enumValues)[number]
export type EventReminder = typeof eventReminders.$inferSelect
export type AttendanceResponse =
  (typeof attendanceResponseEnum.enumValues)[number]
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAttendee = typeof eventAttendees.$inferSelect
