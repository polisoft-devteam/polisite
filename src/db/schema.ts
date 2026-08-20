// The single definition of the database schema.
// Edit this, then `pnpm db:generate` and `pnpm db:migrate`. Never change tables in the
// Supabase dashboard — see CLAUDE.md.

import {
  date,
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

export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: text("title").notNull(),
  description: text("description"),

  // Stored UTC, displayed in Europe/Stockholm.
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),

  location: text("location"),
  category: text("category"),

  visibility: eventVisibilityEnum("visibility").notNull().default("members"),

  createdByMemberId: uuid("created_by_member_id")
    .notNull()
    .references(() => members.id),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

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
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAttendee = typeof eventAttendees.$inferSelect
