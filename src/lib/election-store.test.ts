import { describe, expect, it } from "vitest"

import { grantSpinsForToday } from "@/lib/election-store"

const state = {
  party: null,
  spinsLeft: 0,
  grantedOn: "2026-09-06",
  tuckedChoice: null,
  isKnown: true,
  identity: "member:1",
}

describe("grantSpinsForToday", () => {
  it("gives an empty wheel one spin on a new day", () => {
    expect(grantSpinsForToday(state, "2026-09-07")).toMatchObject({
      spinsLeft: 1,
      grantedOn: "2026-09-07",
    })
  })

  it("changes nothing on the same day", () => {
    expect(grantSpinsForToday(state, "2026-09-06")).toBe(state)
  })

  it("does not stockpile: three days away is still one spin", () => {
    const away = grantSpinsForToday(state, "2026-09-09")

    expect(grantSpinsForToday(away, "2026-09-10").spinsLeft).toBe(1)
  })

  it("leaves spins already in hand alone", () => {
    expect(
      grantSpinsForToday({ ...state, spinsLeft: 3 }, "2026-09-07").spinsLeft,
    ).toBe(3)
  })
})
