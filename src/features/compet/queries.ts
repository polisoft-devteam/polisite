// Reading and writing the duel on /compet.
//
// The newest competition is the current one. A vote is a row of its own, so the pillars
// are a count of rows and the reasons beside them are the same rows read out.

import { and, desc, eq, gt, inArray } from "drizzle-orm"

import { db } from "@/db"
import { competitionVotes, competitions, members } from "@/db/schema"
import type { Competition, CompetitionVote } from "@/db/schema"
import { memberDisplayName } from "@/features/members/identity"
import { COMPET_WINDOW_MILLISECONDS } from "@/lib/compet"

export type CompetContender = {
  memberId: string
  displayName: string
  avatarUrl: string | null
  bannerUrl: string | null
}

export type CurrentCompetition = {
  id: string
  question: string
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

export async function findCurrentCompetition(): Promise<CurrentCompetition | null> {
  const [competition] = await db
    .select()
    .from(competitions)
    .orderBy(desc(competitions.createdAt))
    .limit(1)

  if (!competition) return null

  const contenders = await db
    .select(memberFields)
    .from(members)
    .where(
      inArray(members.id, [
        competition.leftMemberId,
        competition.rightMemberId,
      ]),
    )

  const contenderFor = (memberId: string, bannerUrl: string | null) => {
    const member = contenders.find((contender) => contender.id === memberId)
    if (!member) return null

    return {
      memberId,
      displayName: memberDisplayName(member),
      avatarUrl: member.avatarUrl,
      bannerUrl,
    }
  }

  const left = contenderFor(competition.leftMemberId, competition.leftBannerUrl)
  const right = contenderFor(
    competition.rightMemberId,
    competition.rightBannerUrl,
  )

  if (!left || !right) return null

  return { id: competition.id, question: competition.question, left, right }
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
  createdByMemberId: string
}): Promise<void> {
  await db.insert(competitions).values(competition)
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
