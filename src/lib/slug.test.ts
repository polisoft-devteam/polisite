// Slugs end up in Discord messages, so a wrong one is a dead link somebody already sent.

import { describe, expect, it } from "vitest"

import { buildEventSlug, toSlug, toUniqueSlug } from "@/lib/slug"

describe("toSlug", () => {
  it("lowercases and joins words with dashes", () => {
    expect(toSlug("Friday Night Skate")).toBe("friday-night-skate")
  })

  it("folds Swedish letters rather than dropping them", () => {
    expect(toSlug("Bastufestival på Ön")).toBe("bastufestival-pa-on")
    expect(toSlug("Årsträff")).toBe("arstraff")
  })

  it("drops punctuation and collapses runs of separators", () => {
    expect(toSlug("Sub Focus — DnB!! (Göteborg)")).toBe(
      "sub-focus-dnb-goteborg",
    )
  })

  it("never starts or ends with a dash", () => {
    expect(toSlug("  -- hello -- ")).toBe("hello")
    expect(toSlug("!!!")).toBe("")
  })

  it("truncates without leaving a trailing dash", () => {
    const slug = toSlug("a".repeat(58) + " bcd")

    expect(slug.length).toBeLessThanOrEqual(60)
    expect(slug.endsWith("-")).toBe(false)
  })
})

describe("buildEventSlug", () => {
  it("appends the date in the event's own timezone", () => {
    // 00:30 in Stockholm is still the 4th in London.
    const instant = new Date("2026-10-04T23:30:00.000Z")

    expect(buildEventSlug("Sauna Festival", instant, "Europe/Stockholm")).toBe(
      "sauna-festival-2026-10-05",
    )
    expect(buildEventSlug("Sauna Festival", instant, "Europe/London")).toBe(
      "sauna-festival-2026-10-05",
    )
  })

  it("omits the date for a suggestion that has none", () => {
    expect(buildEventSlug("Skidresa", null, "Europe/Stockholm")).toBe(
      "skidresa",
    )
  })

  it("falls back to a usable slug when the title has no letters", () => {
    expect(buildEventSlug("!!!", null, "Europe/Stockholm")).toBe("event")
  })
})

describe("toUniqueSlug", () => {
  it("returns the candidate when it's free", async () => {
    expect(await toUniqueSlug("skidresa", async () => false)).toBe("skidresa")
  })

  it("counts up past the ones already taken", async () => {
    const taken = new Set(["skidresa", "skidresa-2", "skidresa-3"])

    expect(
      await toUniqueSlug("skidresa", async (slug) => taken.has(slug)),
    ).toBe("skidresa-4")
  })
})
