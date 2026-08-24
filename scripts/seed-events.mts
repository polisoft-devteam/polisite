/**
 * Creates two example events for working on the design.
 *
 *   pnpm events:seed
 *
 * Writes straight to the database rather than going through createEventAction, so no
 * Discord message is posted — the announcement lives in the action, not the query.
 *
 * Safe to re-run: events are matched by slug and skipped if they already exist.
 */

import { eq } from "drizzle-orm"

import { db } from "../src/db/index"
import { eventAttendees, events, members } from "../src/db/schema"
import { buildEventSlug } from "../src/lib/slug"
import { wallTimeToInstant } from "../src/lib/time"

const TIME_ZONE = "Europe/Stockholm"

const [creator] = await db
  .select()
  .from(members)
  .where(eq(members.status, "active"))
  .limit(1)

if (!creator) {
  console.error(
    "No active member to credit as the creator. Add yourself first.",
  )
  process.exit(1)
}

const seeds = [
  {
    title: "Fotbollsfest",
    description:
      "Vi tar över baren, ser matchen och stannar kvar långt efter slutsignalen. Ta med den som vill hänga.",
    startsAtWallTime: "2026-11-14T19:00",
    location: "Andra Långgatan 21, Göteborg",
    category: "party" as const,
    imageUrl: "/images/tall_fotball_fest.webp",
    visibility: "members_and_friends" as const,
    priceMinorUnits: 15000,
  },
  {
    title: "Poli Meet",
    description:
      "Årets träff. Vi går igenom året som gått, planerar nästa och äter alldeles för mycket.",
    startsAtWallTime: "2026-12-05T17:30",
    location: "Hotell Pigalle, Göteborg",
    category: "board_meeting" as const,
    imageUrl: "/images/wide_poli_meet.webp",
    visibility: "members" as const,
    priceMinorUnits: null,
  },
]

for (const seed of seeds) {
  const startsAt = wallTimeToInstant(seed.startsAtWallTime, TIME_ZONE)
  const slug = buildEventSlug(seed.title, startsAt, TIME_ZONE)

  const [existing] = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.slug, slug))
    .limit(1)

  if (existing) {
    console.log(`  ${slug} — already there, skipped`)
    continue
  }

  const [created] = await db
    .insert(events)
    .values({
      slug,
      title: seed.title,
      description: seed.description,
      kind: "confirmed",
      startsAt,
      timeZone: TIME_ZONE,
      location: seed.location,
      category: seed.category,
      imageUrl: seed.imageUrl,
      visibility: seed.visibility,
      priceMinorUnits: seed.priceMinorUnits,
      priceCurrency: "SEK",
      createdByMemberId: creator.id,
    })
    .returning()

  // Whoever arranges it is coming, same as the real create flow.
  await db
    .insert(eventAttendees)
    .values({ eventId: created.id, memberId: creator.id, response: "going" })
    .onConflictDoNothing()

  console.log(`  ${slug} — created`)
}

console.log(
  "\nNothing was posted to Discord: this writes to the database directly.",
)

process.exit(0)
