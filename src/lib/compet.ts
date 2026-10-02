// The arithmetic behind /compet: how many votes you have left, and how the pillars split.
//
// Pure functions over plain data, shared by the server action that enforces the limit and
// the page that shows it, so the two cannot disagree about when the next vote is allowed.

export const COMPET_VOTES_PER_WINDOW = 3
export const COMPET_WINDOW_MILLISECONDS = 5 * 60 * 1000

export type CompetVoteAllowance = {
  votesLeft: number
  /** When the oldest vote in the window expires and a vote comes back. Null with votes left. */
  nextVoteAt: Date | null
}

/** A rolling window: each vote counts against you for five minutes after it was cast. */
export function competVoteAllowance(
  ownVoteTimes: Date[],
  now: Date,
): CompetVoteAllowance {
  const windowStart = now.getTime() - COMPET_WINDOW_MILLISECONDS

  const votesInWindow = ownVoteTimes
    .map((votedAt) => votedAt.getTime())
    .filter((votedAt) => votedAt > windowStart)
    .sort((first, second) => first - second)

  const votesLeft = Math.max(COMPET_VOTES_PER_WINDOW - votesInWindow.length, 0)

  if (votesLeft > 0) return { votesLeft, nextVoteAt: null }

  // The vote that frees a slot is the one that falls out of the window first.
  const freedByVote =
    votesInWindow[votesInWindow.length - COMPET_VOTES_PER_WINDOW]
  return {
    votesLeft,
    nextVoteAt: new Date(freedByVote + COMPET_WINDOW_MILLISECONDS),
  }
}

/** Whole percentages that always add up to 100, or both zero before anyone has voted. */
export function competShares(
  leftVotes: number,
  rightVotes: number,
): { left: number; right: number } {
  const total = leftVotes + rightVotes
  if (total === 0) return { left: 0, right: 0 }

  const left = Math.round((leftVotes / total) * 100)
  return { left, right: 100 - left }
}
