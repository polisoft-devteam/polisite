// The grid must not shift by a day depending on the machine's timezone, which is exactly
// what happens if this arithmetic is done in local time.

import { describe, expect, it } from "vitest"

import {
  addMonthsUtc,
  buildMonthGridDays,
  parseMonthParam,
  toDayKey,
  toMonthParam,
  WEEKS_IN_MONTH_GRID,
} from "@/lib/calendar"

describe("month grid", () => {
  it("always renders six full weeks", () => {
    const days = buildMonthGridDays(new Date(Date.UTC(2026, 8, 1)))

    expect(days).toHaveLength(WEEKS_IN_MONTH_GRID * 7)
  })

  it("starts on the Monday on or before the first of the month", () => {
    // 1 September 2026 is a Tuesday, so the grid opens on Monday 31 August.
    const days = buildMonthGridDays(new Date(Date.UTC(2026, 8, 1)))

    expect(toDayKey(days[0])).toBe("2026-08-31")
    expect(days[0].getUTCDay()).toBe(1)
  })

  it("does not skip a week when the month already starts on a Monday", () => {
    // 1 June 2026 is a Monday.
    const days = buildMonthGridDays(new Date(Date.UTC(2026, 5, 1)))

    expect(toDayKey(days[0])).toBe("2026-06-01")
  })

  it("reaches back six days when the month starts on a Sunday", () => {
    // 1 November 2026 is a Sunday.
    const days = buildMonthGridDays(new Date(Date.UTC(2026, 10, 1)))

    expect(toDayKey(days[0])).toBe("2026-10-26")
  })

  it("keeps every square at UTC midnight across a daylight saving change", () => {
    // The grid for October 2026 spans the end of European summer time.
    const days = buildMonthGridDays(new Date(Date.UTC(2026, 9, 1)))

    for (const day of days) {
      expect(day.getUTCHours()).toBe(0)
    }
  })
})

describe("month parameters", () => {
  it("round-trips a month through the URL", () => {
    const september = new Date(Date.UTC(2026, 8, 1))

    expect(toMonthParam(september)).toBe("2026-09")
    expect(parseMonthParam("2026-09").getTime()).toBe(september.getTime())
  })

  it("falls back to the current month for junk input", () => {
    for (const junk of [undefined, "", "nonsense", "2026-13", "2026-00"]) {
      const parsed = parseMonthParam(junk)

      expect(parsed.getUTCDate()).toBe(1)
      expect(parsed.getUTCHours()).toBe(0)
    }
  })

  it("rolls the year over correctly", () => {
    const december = new Date(Date.UTC(2026, 11, 1))

    expect(toMonthParam(addMonthsUtc(december, 1))).toBe("2027-01")
    expect(toMonthParam(addMonthsUtc(december, -12))).toBe("2025-12")
  })
})
