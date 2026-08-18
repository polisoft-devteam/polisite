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

// "pending"  = signed in with Google but not yet approved. Sees only public content.
// "active"   = a real member.
// "inactive" = left or was removed. Kept as a row so their history stays intact.
export const memberStatusEnum = pgEnum("member_status", [
  "pending",
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

  // Display labels only. These grant nothing — permissions live in roles, see CLAUDE.md.
  officialTitle: text("official_title"), // "Sekreterare", "Ordförande"
  funTitle: text("fun_title"), // whatever the group decides someone is

  bio: text("bio"),

  // Date only, no time — nobody needs the hour someone was born, and a timestamp would
  // shift across timezones and show the wrong day.
  birthday: date("birthday"),

  status: memberStatusEnum("status").notNull().default("pending"),

  // When they joined the association — not when the row was created.
  memberSince: timestamp("member_since", { withTimezone: true }),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
})

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
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type EventAttendee = typeof eventAttendees.$inferSelect
