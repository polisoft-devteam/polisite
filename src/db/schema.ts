// The single definition of the database schema. Edit this, then run:
//   pnpm db:generate   creates a migration file from the difference
//   pnpm db:migrate    applies it
// Never change tables in the Supabase dashboard — see CLAUDE.md.

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

// "guest"    = signed in with Google, but not a member. Sees exactly what a signed-out
//              visitor sees. This is where everyone starts.
// "active"   = a real member.
// "inactive" = left or was removed. Kept as a row so their history stays intact.
export const memberStatusEnum = pgEnum("member_status", [
  "guest",
  "active",
  "inactive",
])

export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),

  // The Supabase Auth user id. Deliberately not a foreign key: auth.users lives in a
  // schema Supabase owns and our migrations don't manage. Null until someone signs in.
  authUserId: uuid("auth_user_id").unique(),

  // Seeded from Google on first sign-in, then owned by the member. Later logins must
  // not overwrite these — someone who fixes their own name should keep the fix.
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),

  // What people actually call them. Shown instead of the full name where space is tight.
  nickname: text("nickname"),

  // Display labels only. These grant nothing — permissions live in roles, see CLAUDE.md.
  officialTitle: text("official_title"), // "Sekreterare", "Ordförande"
  funTitle: text("fun_title"), // whatever the group decides someone is

  bio: text("bio"),

  // Date only, no time — nobody needs the hour someone was born, and a timestamp would
  // shift across timezones and show the wrong day.
  birthday: date("birthday"),

  status: memberStatusEnum("status").notNull().default("guest"),

  // When they joined the association — not when the row was created.
  memberSince: timestamp("member_since", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

// --- Roles ---------------------------------------------------------------------

// A member can hold several roles, so these are rows rather than a column on the member.
// These grant permissions — unlike officialTitle and funTitle, which are just labels.
//
// Deliberately only two: everyone in the association is on the board, so "board" said
// nothing, and there is nobody to moderate. Add roles when a real rule needs one.
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

// "public"  = guests included, no login needed.
// "members" = any active member.
// "private" = invited only.
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

  // Stored UTC, displayed in Europe/Stockholm. endsAt is null for open-ended things.
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
