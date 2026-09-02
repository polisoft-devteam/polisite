// The name someone is given before they choose one, which then appears on every card and
// in the header, so it is worth getting right.

import { describe, expect, it } from "vitest"

import { memberNameFrom } from "@/features/members/display-name"

describe("member name from Google or the address", () => {
  it("prefers the name Google gave us", () => {
    expect(memberNameFrom("Victor Persson", "vp@example.com")).toBe(
      "Victor Persson",
    )
  })

  it("falls back to the part before the @", () => {
    expect(memberNameFrom(null, "victor.persson@example.com")).toBe(
      "victor.persson",
    )
  })

  it("treats a blank or whitespace name as no name", () => {
    expect(memberNameFrom("", "vp@example.com")).toBe("vp")
    expect(memberNameFrom("   ", "vp@example.com")).toBe("vp")
  })

  it("keeps the address when there is nothing before the @", () => {
    expect(memberNameFrom(null, "@example.com")).toBe("@example.com")
  })
})
