// Patches, in the scouting sense: an admin hands one out and it sits on the member's
// profile.
//
// Defined here rather than in the database, because a badge is a key, an icon and two
// lines of copy. None of that belongs in a table, and holding it here means a new badge is
// an edit and a translation rather than a migration. The database only records who has
// which key.

import type { ComponentType } from "react"

import {
  BirthdayIcon,
  PartyIcon,
  SportIcon,
  TripIcon,
  WishlistIcon,
} from "@/lib/icons"

export type BadgeDefinition = {
  key: string
  Icon: ComponentType<{ className?: string }>
}

export const BADGES: BadgeDefinition[] = [
  { key: "poli", Icon: PartyIcon },
  { key: "yearsOfService", Icon: BirthdayIcon },
  { key: "traveller", Icon: TripIcon },
  { key: "sportsman", Icon: SportIcon },
  { key: "gifter", Icon: WishlistIcon },
]

export const BADGE_KEYS = BADGES.map((badge) => badge.key)

export function findBadge(key: string): BadgeDefinition | undefined {
  return BADGES.find((badge) => badge.key === key)
}
