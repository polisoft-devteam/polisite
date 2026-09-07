// What the wheel has made of the association so far: a bar per party, longest first.
//
// A race rather than a poll, so the bar counts every spin anybody has had, and the faces
// on it are the people who landed there at least once. Somebody who got Liberalerna three
// days running is three votes and one face.
//
// A hand-built bar rather than a chart library, for the same reason the calendar is a grid
// of links: it is a row, a coloured strip and a number. The strip is the party's own
// colour, so the reading is the same as on the wheel. Parties nobody landed on are left
// out; twelve empty rows say nothing.

import { MemberAvatar } from "@/components/MemberAvatar"
import { EmptyState } from "@/components/EmptyState"
import { SiteImage } from "@/components/SiteImage"
import type { ElectionVoteWithMember } from "@/features/election/queries"
import { memberDisplayName } from "@/features/members/identity"
import { SWEDISH_PARTIES } from "@/lib/election"

/** How many faces fit on a bar before the rest become a number. */
const FACES_SHOWN = 6

export function ElectionResults({
  votes,
  partyLogos,
  emptyText,
  voteCountLabel,
}: {
  votes: ElectionVoteWithMember[]
  /** Party key to its logo, for the parties somebody has dropped a picture in for. */
  partyLogos: Map<string, string>
  emptyText: string
  /** e.g. "3 röster", already counted and translated by the page. */
  voteCountLabel: (count: number) => string
}) {
  if (votes.length === 0) return <EmptyState>{emptyText}</EmptyState>

  const standings = SWEDISH_PARTIES.map((party) => {
    const partyVotes = votes.filter((vote) => vote.partyKey === party.key)

    // One face per person however often they landed here, in the order they last did.
    const voters = [
      ...new Map(
        partyVotes.map((vote) => [vote.member.id, vote.member]),
      ).values(),
    ]

    return { party, voteCount: partyVotes.length, voters }
  })
    .filter((standing) => standing.voteCount > 0)
    .sort((a, b) => b.voteCount - a.voteCount)

  const mostVotes = standings[0]?.voteCount ?? 1

  return (
    <ul className="space-y-3">
      {standings.map(({ party, voteCount, voters }) => {
        const logo = partyLogos.get(party.key)

        return (
          <li key={party.key} className="flex items-center gap-3">
            <span className="flex w-16 shrink-0 items-center gap-2 text-sm font-medium sm:w-28">
              {logo && (
                <SiteImage
                  src={logo}
                  alt=""
                  className="size-6 shrink-0"
                  sizes="24px"
                  rounded="rounded-sm"
                />
              )}
              {party.abbreviation}
            </span>

            {/* The strip is the vote; the track behind it only shows the scale. */}
            <span className="bg-muted h-8 min-w-0 flex-1 overflow-hidden rounded-md">
              <span
                className="flex h-full items-center gap-1 rounded-md px-2"
                style={{
                  width: `${Math.max((voteCount / mostVotes) * 100, 14)}%`,
                  backgroundColor: party.color,
                  color: party.textColor,
                }}
              >
                {voters.slice(0, FACES_SHOWN).map((voter) => (
                  <MemberAvatar
                    key={voter.id}
                    fullName={memberDisplayName(voter)}
                    avatarUrl={voter.avatarUrl}
                    className="size-6 text-[0.6rem]"
                  />
                ))}

                {voters.length > FACES_SHOWN && (
                  <span className="text-xs font-semibold">
                    +{voters.length - FACES_SHOWN}
                  </span>
                )}
              </span>
            </span>

            <span className="text-muted-foreground w-20 shrink-0 text-right text-xs tabular-nums sm:w-24">
              {voteCountLabel(voteCount)}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
