"use server"

import { revalidatePath } from "next/cache"
import { getLocale } from "next-intl/server"

import {
  createCompetition,
  deleteCompetitionVote,
  findCompetitionById,
  findCompetitionVoteById,
  findOwnVoteTimes,
  recordCompetitionVote,
  updateCompetitionVote,
} from "@/features/compet/queries"
import {
  competitionFormSchema,
  competitionVoteFormSchema,
  competitionVoteIdSchema,
} from "@/features/compet/schemas"
import { findMemberById } from "@/features/members/queries"
import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { isCompetitionOpen } from "@/lib/compet"
import {
  canCreateCompetition,
  canEditCompetitionVote,
  canRemoveCompetitionVote,
  canVoteInCompetition,
} from "@/lib/permissions"
import { uploadImage } from "@/lib/storage"
import { DEFAULT_EVENT_TIME_ZONE, wallTimeToInstant } from "@/lib/time"

/** What a form on /compet is told afterwards. `at` makes two identical answers differ. */
export type CompetFormResult = {
  outcome: "done" | "invalid" | "rateLimited" | "closed"
  at: number
} | null

export async function createCompetitionAction(
  _previous: CompetFormResult,
  formData: FormData,
): Promise<CompetFormResult> {
  const viewer = await getViewer()
  if (!canCreateCompetition(viewer)) return null

  const parsed = competitionFormSchema.safeParse({
    question: formData.get("question") ?? "",
    leftMemberId: formData.get("leftMemberId") ?? "",
    rightMemberId: formData.get("rightMemberId") ?? "",
    endsAtWallTime: formData.get("endsAtWallTime") ?? "",
  })
  if (!parsed.success) return { outcome: "invalid", at: Date.now() }

  // Typed as Swedish time, like an event: the admin is here, and so are most voters.
  const { endsAtWallTime, ...competition } = parsed.data
  const endsAt = wallTimeToInstant(endsAtWallTime, DEFAULT_EVENT_TIME_ZONE)
  if (!isCompetitionOpen(endsAt, new Date())) {
    return { outcome: "invalid", at: Date.now() }
  }

  // Both must be members today, not just members when the list was rendered.
  const [leftMember, rightMember] = await Promise.all([
    findMemberById(competition.leftMemberId),
    findMemberById(competition.rightMemberId),
  ])
  if (!leftMember || !rightMember) return { outcome: "invalid", at: Date.now() }

  const [leftBannerUrl, rightBannerUrl] = await Promise.all([
    uploadImage("compet-images", formData.get("leftBanner") as File | null),
    uploadImage("compet-images", formData.get("rightBanner") as File | null),
  ])

  const competitionId = await createCompetition({
    ...competition,
    leftBannerUrl,
    rightBannerUrl,
    endsAt,
    createdByMemberId: viewer!.member!.id,
  })

  revalidatePath("/", "layout")

  // Straight to the new duel's tab rather than wherever the admin happened to be.
  redirect({ href: `/compet?duel=${competitionId}`, locale: await getLocale() })
  return null
}

export async function voteInCompetitionAction(
  _previous: CompetFormResult,
  formData: FormData,
): Promise<CompetFormResult> {
  const viewer = await getViewer()
  if (!viewer?.member) return null

  const parsed = competitionVoteFormSchema.safeParse({
    competitionId: formData.get("competitionId") ?? "",
    votedForMemberId: formData.get("votedForMemberId") ?? "",
    reason: formData.get("reason") ?? "",
    voteId: formData.get("voteId") || undefined,
  })
  if (!parsed.success) return { outcome: "invalid", at: Date.now() }

  const { voteId, ...vote } = parsed.data

  const competition = await findCompetitionById(parsed.data.competitionId)
  const isContender =
    competition !== null &&
    [competition.leftMemberId, competition.rightMemberId].includes(
      parsed.data.votedForMemberId,
    )
  if (!isContender) return { outcome: "invalid", at: Date.now() }

  const state = { isOpen: isCompetitionOpen(competition.endsAt, new Date()) }
  if (!state.isOpen) return { outcome: "closed", at: Date.now() }

  // An edit changes a vote already counted, so it costs nothing against the limit.
  if (voteId) {
    const existing = await findCompetitionVoteById(voteId)
    if (
      !existing ||
      existing.competitionId !== competition.id ||
      !canEditCompetitionVote(viewer, state, existing)
    ) {
      return { outcome: "invalid", at: Date.now() }
    }

    await updateCompetitionVote(voteId, {
      votedForMemberId: vote.votedForMemberId,
      reason: vote.reason,
    })

    revalidatePath("/compet")
    return { outcome: "done", at: Date.now() }
  }

  // Re-read from the database rather than trusting the page's countdown.
  const ownVoteTimes = await findOwnVoteTimes(competition.id, viewer.member.id)
  if (!canVoteInCompetition(viewer, state, ownVoteTimes, new Date())) {
    return { outcome: "rateLimited", at: Date.now() }
  }

  await recordCompetitionVote({
    ...vote,
    voterMemberId: viewer.member.id,
  })

  revalidatePath("/compet")
  return { outcome: "done", at: Date.now() }
}

export async function removeCompetitionVoteAction(formData: FormData) {
  const viewer = await getViewer()

  const voteId = competitionVoteIdSchema.safeParse(formData.get("voteId"))
  if (!voteId.success) return

  const vote = await findCompetitionVoteById(voteId.data)
  if (!vote) return

  const competition = await findCompetitionById(vote.competitionId)
  if (!competition) return

  const state = { isOpen: isCompetitionOpen(competition.endsAt, new Date()) }
  if (!canRemoveCompetitionVote(viewer, state, vote)) return

  await deleteCompetitionVote(vote.id)
  revalidatePath("/compet")
}
