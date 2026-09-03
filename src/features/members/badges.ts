// Patches, in the scouting sense.
//
// Defined here rather than in the database, because a badge is a key, an icon and two
// lines of copy. None of that belongs in a table, and holding it here means a new badge is
// an edit and a translation rather than a migration. The database only records who has
// which key, and how far up it they are.
//
// Two kinds. An admin badge is handed out by a person, for something the app cannot see.
// An automatic one is earned, and is worked out from the member's own history by
// badge-rules.ts — nobody awards it and nobody can ask for it.
//
// Titles are English in both languages. They are award names rather than interface copy,
// and a Trotjänare and a Years of Service: XII are not the same thing to be handed.

import type { ComponentType } from "react"

import {
  BirthdayIcon,
  NewEventIcon,
  PartyIcon,
  SportIcon,
  AttendingIcon,
  TripIcon,
  WishlistIcon,
} from "@/lib/icons"

export type BadgeDefinition = {
  key: string
  Icon: ComponentType<{ className?: string }>
  /** Handed out by a person, or worked out from what the member has done. */
  awardedBy: "admin" | "automatic"
  /** The highest rung, for a badge that counts up. Absent means it has no rungs. */
  maxTier?: number
}

export const BADGES: BadgeDefinition[] = [
  { key: "poli", Icon: PartyIcon, awardedBy: "automatic" },
  { key: "organiser", Icon: NewEventIcon, awardedBy: "automatic" },
  { key: "attendee", Icon: AttendingIcon, awardedBy: "automatic" },
  {
    key: "yearsOfService",
    Icon: BirthdayIcon,
    awardedBy: "automatic",
    maxTier: 20,
  },
  { key: "traveller", Icon: TripIcon, awardedBy: "automatic" },
  { key: "sportsman", Icon: SportIcon, awardedBy: "admin" },
  { key: "gifter", Icon: WishlistIcon, awardedBy: "admin" },
]

export const BADGE_KEYS = BADGES.map((badge) => badge.key)

/** The ones an admin may hand out. The rest are earned, so offering them would be a lie. */
export const ADMIN_AWARDED_BADGES = BADGES.filter(
  (badge) => badge.awardedBy === "admin",
)

export function findBadge(key: string): BadgeDefinition | undefined {
  return BADGES.find((badge) => badge.key === key)
}

const ROMAN_NUMERALS = [
  [10, "X"],
  [9, "IX"],
  [5, "V"],
  [4, "IV"],
  [1, "I"],
] as const

/** Roman numerals, which stop being kind well before the twenty we need. */
export function toRomanNumeral(value: number): string {
  let remaining = Math.max(0, Math.floor(value))
  let numeral = ""

  for (const [amount, symbol] of ROMAN_NUMERALS) {
    while (remaining >= amount) {
      numeral += symbol
      remaining -= amount
    }
  }

  return numeral
}

/** "Years of Service: XII", or just the name when the badge has no rungs. */
export function badgeTitle(name: string, tier: number | null): string {
  return tier === null ? name : `${name}: ${toRomanNumeral(tier)}`
}
