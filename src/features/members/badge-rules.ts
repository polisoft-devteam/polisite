// What a member has earned, from what they have done. No database and no clock of its own,
// so every rule here is a plain function of its inputs and can be tested as one.
//
// Awards only, never takes away. A count can fall — an event gets deleted, an answer is
// changed — and a patch that vanishes off a profile is worse than one that is a little
// generous. Years of Service is the same: the rung only ever goes up.

const YEARS_OF_SERVICE_MAX_TIER = 20
const IN_PERSON_EVENTS_FOR_TRAVELLER = 3

export type BadgeFacts = {
  isActiveMember: boolean
  /** When they joined the association, not when the row was made. */
  joinedAssociationAt: Date | null
  eventsCreated: number
  /** Events that have already happened and that they said they were coming to. */
  pastEventsAttended: number
  /** Of those, the ones with an address rather than a link. */
  pastInPersonEventsAttended: number
}

export type EarnedBadge = {
  key: string
  /** The rung reached, for a badge that counts up. Null for the rest. */
  tier: number | null
}

/**
 * Whole years between two instants, counted in UTC.
 *
 * Not date-fns' differenceInYears, which counts in the machine's timezone and so answers
 * differently on a Copenhagen laptop than on the server. See lib/time.ts.
 */
export function wholeYearsBetween(from: Date, to: Date): number {
  let years = to.getUTCFullYear() - from.getUTCFullYear()

  const monthsIn = to.getUTCMonth() - from.getUTCMonth()
  const daysIn = to.getUTCDate() - from.getUTCDate()

  // The anniversary has not come round yet this year.
  if (monthsIn < 0 || (monthsIn === 0 && daysIn < 0)) years -= 1

  return years
}

export function earnedBadges(facts: BadgeFacts, now: Date): EarnedBadge[] {
  // Everything here is a statement about a member of the association. Someone still
  // waiting to be let in has no history worth reading.
  if (!facts.isActiveMember) return []

  const earned: EarnedBadge[] = [{ key: "poli", tier: null }]

  if (facts.eventsCreated >= 1) earned.push({ key: "organiser", tier: null })
  if (facts.pastEventsAttended >= 1)
    earned.push({ key: "attendee", tier: null })

  if (facts.pastInPersonEventsAttended >= IN_PERSON_EVENTS_FOR_TRAVELLER) {
    earned.push({ key: "traveller", tier: null })
  }

  if (facts.joinedAssociationAt) {
    const years = wholeYearsBetween(facts.joinedAssociationAt, now)

    if (years >= 1) {
      earned.push({
        key: "yearsOfService",
        tier: Math.min(years, YEARS_OF_SERVICE_MAX_TIER),
      })
    }
  }

  return earned
}
