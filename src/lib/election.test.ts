import { describe, expect, it } from "vitest"

import { isElectionOpen } from "@/lib/election"

describe("isElectionOpen", () => {
  it("is open through the whole of election day in Stockholm", () => {
    expect(isElectionOpen(new Date("2026-09-13T21:59:00Z"))).toBe(true)
  })

  it("is over once Stockholm reaches the next day", () => {
    expect(isElectionOpen(new Date("2026-09-13T22:00:00Z"))).toBe(false)
  })
})
