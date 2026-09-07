// Reading and writing what the wheel has made of everybody.
//
// The only place the election table is touched. A spin is a row, not a replacement: the
// page is a race, so today's spin adds to yesterday's rather than erasing it. What a
// member currently *is* is their newest row; what a party has is all of them.

import { desc, eq } from "drizzle-orm"

import { db } from "@/db"
import { electionVotes, members } from "@/db/schema"

/** One row per spin. Nothing is overwritten, ever. */
export async function recordElectionVote(memberId: string, partyKey: string) {
  await db.insert(electionVotes).values({ memberId, partyKey })
}

export type ElectionVoteWithMember = {
  partyKey: string
  spunAt: Date
  member: {
    id: string
    fullName: string
    nickname: string | null
    email: string
    avatarUrl: string | null
  }
}

/**
 * Every spin anyone has had, newest first.
 *
 * Counted in the page rather than in SQL: ten people spinning once a day for a week is a
 * few hundred rows, and one query that hands over the lot keeps both the standings and
 * the faces beside them honest about the same data.
 */
export async function findElectionVotes(): Promise<ElectionVoteWithMember[]> {
  const rows = await db
    .select({
      partyKey: electionVotes.partyKey,
      spunAt: electionVotes.spunAt,
      id: members.id,
      fullName: members.fullName,
      nickname: members.nickname,
      email: members.email,
      avatarUrl: members.avatarUrl,
    })
    .from(electionVotes)
    .innerJoin(members, eq(members.id, electionVotes.memberId))
    .where(eq(members.status, "active"))
    .orderBy(desc(electionVotes.spunAt))

  return rows.map(({ partyKey, spunAt, ...member }) => ({
    partyKey,
    spunAt,
    member,
  }))
}
