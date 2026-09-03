// The badge rules. These decide what appears on a member's profile without anyone asking,
// so they are worth pinning down: a rule that quietly loosens hands out a patch nobody
// earned, and one that tightens takes back a patch somebody already saw.

import { describe, expect, it } from "vitest"

import {
  earnedBadges,
  wholeYearsBetween,
  type BadgeFacts,
} from "@/features/members/badge-rules"
import { badgeTitle, toRomanNumeral } from "@/features/members/badges"

const NOW = new Date("2026-09-03T12:00:00Z")

function facts(overrides: Partial<BadgeFacts> = {}): BadgeFacts {
  return {
    isActiveMember: true,
    joinedAssociationAt: null,
    eventsCreated: 0,
    pastEventsAttended: 0,
    pastInPersonEventsAttended: 0,
    ...overrides,
  }
}

const keysOf = (given: BadgeFacts) =>
  earnedBadges(given, NOW).map((badge) => badge.key)

const tierOf = (given: BadgeFacts, key: string) =>
  earnedBadges(given, NOW).find((badge) => badge.key === key)?.tier ?? null

describe("who earns what", () => {
  it("gives a guest nothing at all, whatever their history says", () => {
    expect(
      keysOf(
        facts({
          isActiveMember: false,
          eventsCreated: 9,
          pastInPersonEventsAttended: 9,
        }),
      ),
    ).toEqual([])
  })

  it("gives every active member the Poli badge and nothing else by default", () => {
    expect(keysOf(facts())).toEqual(["poli"])
  })

  it("makes an organiser of anyone who has put on one event", () => {
    expect(keysOf(facts({ eventsCreated: 1 }))).toContain("organiser")
  })

  it("makes an attendee of anyone who has been to one", () => {
    expect(keysOf(facts({ pastEventsAttended: 1 }))).toContain("attendee")
  })
})

describe("traveller, which needs three in person", () => {
  it("is not earned at two", () => {
    expect(keysOf(facts({ pastInPersonEventsAttended: 2 }))).not.toContain(
      "traveller",
    )
  })

  it("is earned at three", () => {
    expect(keysOf(facts({ pastInPersonEventsAttended: 3 }))).toContain(
      "traveller",
    )
  })

  it("does not count events that were online, however many there were", () => {
    // Ten events attended, none of them in person.
    expect(
      keysOf(facts({ pastEventsAttended: 10, pastInPersonEventsAttended: 0 })),
    ).not.toContain("traveller")
  })
})

describe("years of service", () => {
  it("is not given in the first year", () => {
    const joined = new Date("2026-01-01T00:00:00Z")
    expect(keysOf(facts({ joinedAssociationAt: joined }))).not.toContain(
      "yearsOfService",
    )
  })

  it("counts one rung per full year", () => {
    const joined = new Date("2023-09-03T00:00:00Z")
    expect(
      tierOf(facts({ joinedAssociationAt: joined }), "yearsOfService"),
    ).toBe(3)
  })

  it("waits for the anniversary rather than rounding up to it", () => {
    const dayBefore = new Date("2025-09-04T00:00:00Z")
    expect(
      tierOf(facts({ joinedAssociationAt: dayBefore }), "yearsOfService"),
    ).toBe(null)
  })

  it("stops at twenty, however long they stay", () => {
    const joined = new Date("1994-01-01T00:00:00Z")
    expect(
      tierOf(facts({ joinedAssociationAt: joined }), "yearsOfService"),
    ).toBe(20)
  })
})

describe("wholeYearsBetween counts in UTC", () => {
  it("does not gain a year from the machine's timezone", () => {
    const from = new Date("2020-06-15T00:00:00Z")
    // Still the 14th in UTC, but already the 15th in Stockholm. Counted locally this
    // would be a full year and hand out a rung a day early.
    const to = new Date("2021-06-14T23:00:00Z")

    expect(wholeYearsBetween(from, to)).toBe(0)
  })

  it("does not care what hour of the anniversary it is", () => {
    const from = new Date("2020-12-31T23:00:00Z")

    expect(wholeYearsBetween(from, new Date("2021-12-31T00:00:00Z"))).toBe(1)
  })

  it("turns over exactly on the anniversary", () => {
    const from = new Date("2020-06-15T00:00:00Z")

    expect(wholeYearsBetween(from, new Date("2021-06-14T23:59:59Z"))).toBe(0)
    expect(wholeYearsBetween(from, new Date("2021-06-15T00:00:00Z"))).toBe(1)
  })
})

describe("how a tier reads", () => {
  it("numbers every rung the badge can reach", () => {
    expect(Array.from({ length: 20 }, (_, i) => toRomanNumeral(i + 1))).toEqual(
      [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
        "XIII",
        "XIV",
        "XV",
        "XVI",
        "XVII",
        "XVIII",
        "XIX",
        "XX",
      ],
    )
  })

  it("leaves an untiered badge as its plain name", () => {
    expect(badgeTitle("Traveller", null)).toBe("Traveller")
    expect(badgeTitle("Years of Service", 12)).toBe("Years of Service: XII")
  })
})
