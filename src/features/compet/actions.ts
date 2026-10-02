"use server"

import { revalidatePath } from "next/cache"

import {
  createCompetition,
  findCompetitionById,
  findOwnVoteTimes,
  recordCompetitionVote,
} from "@/features/compet/queries"
import {
  competitionFormSchema,
  competitionVoteFormSchema,
} from "@/features/compet/schemas"
import { findMemberById } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { canCreateCompetition, canVoteInCompetition } from "@/lib/permissions"
import { uploadImage } from "@/lib/storage"

/** What a form on /compet is told afterwards. `at` makes two identical answers differ. */
export type CompetFormResult = {
  outcome: "done" | "invalid" | "rateLimited"
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
  })
  if (!parsed.success) return { outcome: "invalid", at: Date.now() }

  // Both must be members today, not just members when the list was rendered.
  const [leftMember, rightMember] = await Promise.all([
    findMemberById(parsed.data.leftMemberId),
    findMemberById(parsed.data.rightMemberId),
  ])
  if (!leftMember || !rightMember) return { outcome: "invalid", at: Date.now() }

  const [leftBannerUrl, rightBannerUrl] = await Promise.all([
    uploadImage("compet-images", formData.get("leftBanner") as File | null),
    uploadImage("compet-images", formData.get("rightBanner") as File | null),
  ])

  await createCompetition({
    ...parsed.data,
    leftBannerUrl,
    rightBannerUrl,
    createdByMemberId: viewer!.member!.id,
  })

  revalidatePath("/compet")
  return { outcome: "done", at: Date.now() }
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
  })
  if (!parsed.success) return { outcome: "invalid", at: Date.now() }

  const competition = await findCompetitionById(parsed.data.competitionId)
  const isContender =
    competition !== null &&
    [competition.leftMemberId, competition.rightMemberId].includes(
      parsed.data.votedForMemberId,
    )
  if (!isContender) return { outcome: "invalid", at: Date.now() }

  // Re-read from the database rather than trusting the page's countdown.
  const ownVoteTimes = await findOwnVoteTimes(competition.id, viewer.member.id)
  if (!canVoteInCompetition(viewer, ownVoteTimes, new Date())) {
    return { outcome: "rateLimited", at: Date.now() }
  }

  await recordCompetitionVote({
    ...parsed.data,
    voterMemberId: viewer.member.id,
  })

  revalidatePath("/compet")
  return { outcome: "done", at: Date.now() }
}
