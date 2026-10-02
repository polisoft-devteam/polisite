import { describe, expect, it } from "vitest"

import {
  competShares,
  competVoteAllowance,
  isCompetitionOpen,
} from "@/lib/compet"

const now = new Date("2026-10-02T12:00:00Z")
const minutesAgo = (minutes: number) =>
  new Date(now.getTime() - minutes * 60 * 1000)

describe("competVoteAllowance", () => {
  it("gives three votes to someone who has not voted", () => {
    expect(competVoteAllowance([], now)).toEqual({
      votesLeft: 3,
      nextVoteBackAt: null,
    })
  })

  it("counts only votes from the last five minutes", () => {
    const allowance = competVoteAllowance(
      [minutesAgo(1), minutesAgo(6), minutesAgo(30)],
      now,
    )

    expect(allowance.votesLeft).toBe(2)
    expect(allowance.nextVoteBackAt).toEqual(
      new Date(minutesAgo(1).getTime() + 5 * 60 * 1000),
    )
  })

  it("says when the oldest vote in the window frees a slot", () => {
    const allowance = competVoteAllowance(
      [minutesAgo(1), minutesAgo(4), minutesAgo(2)],
      now,
    )

    expect(allowance.votesLeft).toBe(0)
    expect(allowance.nextVoteBackAt).toEqual(
      new Date(minutesAgo(4).getTime() + 5 * 60 * 1000),
    )
  })
})

describe("competShares", () => {
  it("is zero on both sides before anyone votes", () => {
    expect(competShares(0, 0)).toEqual({ left: 0, right: 0 })
  })

  it("splits evenly, then by thirds", () => {
    expect(competShares(1, 0)).toEqual({ left: 100, right: 0 })
    expect(competShares(1, 1)).toEqual({ left: 50, right: 50 })
    expect(competShares(2, 1)).toEqual({ left: 67, right: 33 })
  })
})

describe("isCompetitionOpen", () => {
  it("takes votes until the end time and not after", () => {
    expect(isCompetitionOpen(new Date(now.getTime() + 1000), now)).toBe(true)
    expect(isCompetitionOpen(now, now)).toBe(false)
  })
})
