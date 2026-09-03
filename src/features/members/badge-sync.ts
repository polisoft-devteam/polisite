// Works out which automatic badges a member has earned and writes them down.
//
// Called from the two places that change the answer immediately — putting on an event and
// answering one — and from the nightly cron for everyone, which is what actually grants
// the badges that turn on time rather than on an action: a year passing, an event moving
// into the past.
//
// Never throws. A badge is a decoration, and failing to hand one out must not take down
// the thing that earned it.

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

/** One member. Returns what they were found to have earned, for the cron's report. */
export async function syncAutomaticBadges(
  memberId: string,
  now = new Date(),
): Promise<EarnedBadge[]> {
  try {
    const facts: BadgeFacts | null = await findBadgeFactsFor(memberId, now)
    if (!facts) return []

    const earned = earnedBadges(facts, now)
    await awardAll(memberId, earned)

    return earned
  } catch (error) {
    console.error(`[badges] could not sync ${memberId}`, error)
    return []
  }
}

/** Everyone active. One member's failure must not stop the rest, so each is its own try. */
export async function syncAutomaticBadgesForEveryone(
  now = new Date(),
): Promise<number> {
  const memberIds = await findActiveMemberIds()

  for (const memberId of memberIds) {
    await syncAutomaticBadges(memberId, now)
  }

  return memberIds.length
}
