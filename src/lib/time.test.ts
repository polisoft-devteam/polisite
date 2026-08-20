// Daylight saving and per-event timezones are the whole reason this module exists.

import { describe, expect, it } from "vitest"

import {
  instantToWallTime,
  reminderDueAt,
  toDiscordTimestamp,
  wallTimeToInstant,
} from "@/lib/time"

describe("wall time to UTC instant", () => {
  it("subtracts two hours for Stockholm in summer (CEST)", () => {
    const instant = wallTimeToInstant("2026-07-01T18:00", "Europe/Stockholm")

    expect(instant.toISOString()).toBe("2026-07-01T16:00:00.000Z")
  })

  it("subtracts one hour for Stockholm in winter (CET)", () => {
    const instant = wallTimeToInstant("2026-01-15T18:00", "Europe/Stockholm")

    expect(instant.toISOString()).toBe("2026-01-15T17:00:00.000Z")
  })

  it("uses the event's own zone, not the association's", () => {
    // Same wall time, two cities, one hour apart.
    const london = wallTimeToInstant("2026-07-01T19:00", "Europe/London")
    const stockholm = wallTimeToInstant("2026-07-01T19:00", "Europe/Stockholm")

    expect(london.toISOString()).toBe("2026-07-01T18:00:00.000Z")
    expect(stockholm.toISOString()).toBe("2026-07-01T17:00:00.000Z")
  })
})

describe("instant back to wall time", () => {
  it("shows a London concert as the time printed on the ticket", () => {
    const doorsOpen = wallTimeToInstant("2026-07-01T19:00", "Europe/London")

    expect(instantToWallTime(doorsOpen, "Europe/London")).toBe(
      "2026-07-01T19:00",
    )
    // The same instant is an hour later for anyone reading Stockholm time.
    expect(instantToWallTime(doorsOpen, "Europe/Stockholm")).toBe(
      "2026-07-01T20:00",
    )
  })

  it("round-trips across the daylight saving boundary", () => {
    for (const wallTime of ["2026-07-01T18:00", "2026-01-15T18:00"]) {
      const instant = wallTimeToInstant(wallTime, "Europe/Stockholm")

      expect(instantToWallTime(instant, "Europe/Stockholm")).toBe(wallTime)
    }
  })
})

describe("reminder due times", () => {
  const midsummerParty = new Date("2026-06-15T18:00:00.000Z")

  it("counts back the right amount for each offset", () => {
    expect(reminderDueAt(midsummerParty, "day_before").toISOString()).toBe(
      "2026-06-14T18:00:00.000Z",
    )
    expect(reminderDueAt(midsummerParty, "week_before").toISOString()).toBe(
      "2026-06-08T18:00:00.000Z",
    )
    expect(
      reminderDueAt(midsummerParty, "four_weeks_before").toISOString(),
    ).toBe("2026-05-18T18:00:00.000Z")
  })

  it("uses calendar months, not 120 days, for the four-month ping", () => {
    expect(
      reminderDueAt(midsummerParty, "four_months_before").toISOString(),
    ).toBe("2026-02-15T18:00:00.000Z")
  })
})

describe("Discord timestamps", () => {
  it("renders as epoch seconds so Discord localises per reader", () => {
    const instant = new Date("2026-07-01T16:00:00.000Z")

    expect(toDiscordTimestamp(instant)).toBe("<t:1782921600:F>")
    expect(toDiscordTimestamp(instant, "R")).toBe("<t:1782921600:R>")
  })
})
