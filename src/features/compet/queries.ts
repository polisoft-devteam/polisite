// Reading and writing the duels on /compet.
//
// Several duels can run at once, each its own tab. A vote is a row of its own, so the
// pillars are a count of rows and the reasons beside them are the same rows read out.
//
// Whether a duel is still open is worked out here, at read time, so pages and permission
// checks get a plain flag rather than each reading the clock.

import { and, desc, eq, gt, inArray } from "drizzle-orm"

import { db } from "@/db"
import { competitionVotes, competitions, members } from "@/db/schema"
import type { Competition, CompetitionVote } from "@/db/schema"
import { memberDisplayName } from "@/features/members/identity"
import { COMPET_WINDOW_MILLISECONDS, isCompetitionOpen } from "@/lib/compet"

export type CompetContender = {
  memberId: string
  displayName: string
  avatarUrl: string | null
  bannerUrl: string | null
}

/** The duel on screen: who is in it, and whether it still takes votes. */
export type CurrentCompetition = {
  id: string
  question: string
  endsAt: Date
  isOpen: boolean
  left: CompetContender
  right: CompetContender
}

export type CompetVote = {
  id: string
  voterMemberId: string
  votedForMemberId: string
  reason: string
  createdAt: Date
  voter: { displayName: string; avatarUrl: string | null }
}

const memberFields = {
  id: members.id,
  fullName: members.fullName,
  nickname: members.nickname,
  email: members.email,
  avatarUrl: members.avatarUrl,
}

/** Puts faces on competition rows, with one query for every contender at once. */
async function withContenders(
  rows: Competition[],
): Promise<CurrentCompetition[]> {
  if (rows.length === 0) return []

  const contenderIds = rows.flatMap((row) => [
    row.leftMemberId,
    row.rightMemberId,
  ])
  const contenders = await db
    .select(memberFields)
    .from(members)
    .where(inArray(members.id, contenderIds))

  const contenderFor = (
    memberId: string,
    bannerUrl: string | null,
  ): CompetContender | null => {
    const member = contenders.find((contender) => contender.id === memberId)
    if (!member) return null

    return {
      memberId,
      displayName: memberDisplayName(member),
      avatarUrl: member.avatarUrl,
      bannerUrl,
    }
  }

  const now = new Date()

  return rows.flatMap((row) => {
    const left = contenderFor(row.leftMemberId, row.leftBannerUrl)
    const right = contenderFor(row.rightMemberId, row.rightBannerUrl)
    if (!left || !right) return []

    return [
      {
        id: row.id,
        question: row.question,
        endsAt: row.endsAt,
        isOpen: isCompetitionOpen(row.endsAt, now),
        left,
        right,
      },
    ]
  })
}

/**
 * Every duel, for the tabs: the ones still running first, newest first, then the decided
 * ones, most recently ended first.
 */
export async function findAllCompetitions(): Promise<CurrentCompetition[]> {
  const rows = await db
    .select()
    .from(competitions)
    .orderBy(desc(competitions.createdAt))

  const all = await withContenders(rows)

  return [
    ...all.filter((competition) => competition.isOpen),
    ...all
      .filter((competition) => !competition.isOpen)
      .sort(
        (first, second) => second.endsAt.getTime() - first.endsAt.getTime(),
      ),
  ]
}

/** The duels still taking votes, newest first, for the corner widget. */
export async function findOpenCompetitions(): Promise<CurrentCompetition[]> {
  const rows = await db
    .select()
    .from(competitions)
    .where(gt(competitions.endsAt, new Date()))
    .orderBy(desc(competitions.createdAt))

  return withContenders(rows)
}

export async function findCompetitionById(
  competitionId: string,
): Promise<Competition | null> {
  const [competition] = await db
    .select()
    .from(competitions)
    .where(eq(competitions.id, competitionId))
    .limit(1)

  return competition ?? null
}

/** Every vote with its reason, newest first. */
export async function findCompetitionVotes(
  competitionId: string,
): Promise<CompetVote[]> {
  const rows = await db
    .select({
      id: competitionVotes.id,
      voterMemberId: competitionVotes.voterMemberId,
      votedForMemberId: competitionVotes.votedForMemberId,
      reason: competitionVotes.reason,
      createdAt: competitionVotes.createdAt,
      voter: memberFields,
    })
    .from(competitionVotes)
    .innerJoin(members, eq(members.id, competitionVotes.voterMemberId))
    .where(eq(competitionVotes.competitionId, competitionId))
    .orderBy(desc(competitionVotes.createdAt))

  return rows.map(({ voter, ...vote }) => ({
    ...vote,
    voter: {
      displayName: memberDisplayName(voter),
      avatarUrl: voter.avatarUrl,
    },
  }))
}

/** When this member voted inside the current rate-limit window. */
export async function findOwnVoteTimes(
  competitionId: string,
  voterMemberId: string,
): Promise<Date[]> {
  const windowStart = new Date(Date.now() - COMPET_WINDOW_MILLISECONDS)

  const rows = await db
    .select({ createdAt: competitionVotes.createdAt })
    .from(competitionVotes)
    .where(
      and(
        eq(competitionVotes.competitionId, competitionId),
        eq(competitionVotes.voterMemberId, voterMemberId),
        gt(competitionVotes.createdAt, windowStart),
      ),
    )

  return rows.map((row) => row.createdAt)
}

export async function createCompetition(competition: {
  question: string
  leftMemberId: string
  rightMemberId: string
  leftBannerUrl: string | null
  rightBannerUrl: string | null
  endsAt: Date
  createdByMemberId: string
}): Promise<string> {
  const [created] = await db
    .insert(competitions)
    .values(competition)
    .returning({ id: competitions.id })

  return created.id
}

export async function recordCompetitionVote(vote: {
  competitionId: string
  voterMemberId: string
  votedForMemberId: string
  reason: string
}): Promise<void> {
  await db.insert(competitionVotes).values(vote)
}

export async function findCompetitionVoteById(
  voteId: string,
): Promise<CompetitionVote | null> {
  const [vote] = await db
    .select()
    .from(competitionVotes)
    .where(eq(competitionVotes.id, voteId))
    .limit(1)

  return vote ?? null
}

/** Rewording or switching sides keeps the vote's place in time and in the rate limit. */
export async function updateCompetitionVote(
  voteId: string,
  change: { votedForMemberId: string; reason: string },
): Promise<void> {
  await db
    .update(competitionVotes)
    .set(change)
    .where(eq(competitionVotes.id, voteId))
}

export async function deleteCompetitionVote(voteId: string): Promise<void> {
  await db.delete(competitionVotes).where(eq(competitionVotes.id, voteId))
}
