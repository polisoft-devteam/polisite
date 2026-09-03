// Works out which automatic badges a member has earned and writes them down.
//
// Called from the two places that change the answer immediately — putting on an event and
// answering one — and from the nightly cron for everyone, which is what actually grants
// the badges that turn on time rather than on an action: a year passing, an event moving
// into the past.
//
// Never throws. A badge is a decoration, and failing to hand one out must not take down
// the thing that earned it. But swallowed is not the same as unnoticed: the nightly run
// counts what failed and says so, both in what it returns and in the admin's Discord
// channel, because a console line in a dev server nobody is reading is not a report.

import {
  earnedBadges,
  type BadgeFacts,
  type EarnedBadge,
} from "@/features/members/badge-rules"
import {
  awardOrRaiseBadge,
  findActiveMemberIds,
  findBadgeFactsFor,
} from "@/features/members/queries"

async function awardAll(memberId: string, badges: EarnedBadge[]) {
  for (const badge of badges) {
    await awardOrRaiseBadge({ memberId, badge: badge.key, tier: badge.tier })
  }
}

/** One member. Returns what they were found to have earned, or null if it could not. */
export async function syncAutomaticBadges(
  memberId: string,
  now = new Date(),
): Promise<EarnedBadge[] | null> {
  try {
    const facts: BadgeFacts | null = await findBadgeFactsFor(memberId, now)
    if (!facts) return []

    const earned = earnedBadges(facts, now)
    await awardAll(memberId, earned)

    return earned
  } catch (error) {
    // The member id, not their name: this line ends up in a hosting provider's log.
    console.error(
      `[badges] sync failed for member ${memberId}. ` +
        `The rules are in features/members/badge-rules.ts, the queries in ` +
        `features/members/queries.ts (findBadgeFactsFor, awardOrRaiseBadge).`,
      error,
    )
    return null
  }
}

export type BadgeSyncReport = {
  checked: number
  failed: number
  /** The first thing that went wrong, to save reading the whole log to find out. */
  firstError: string | null
}

/** Everyone active. One member's failure must not stop the rest, so each is its own try. */
export async function syncAutomaticBadgesForEveryone(
  now = new Date(),
): Promise<BadgeSyncReport> {
  const memberIds = await findActiveMemberIds()

  let failed = 0
  let firstError: string | null = null

  for (const memberId of memberIds) {
    const earned = await syncAutomaticBadges(memberId, now)

    if (earned === null) {
      failed += 1
      firstError ??= `member ${memberId}`
    }
  }

  return { checked: memberIds.length, failed, firstError }
}
