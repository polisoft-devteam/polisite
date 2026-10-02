// Zod at the server boundary for the duel's two forms.

import { z } from "zod"

export const competitionFormSchema = z
  .object({
    question: z.string().trim().min(1).max(140),
    leftMemberId: z.string().uuid(),
    rightMemberId: z.string().uuid(),
    // As a datetime-local input sends it, read as Stockholm time by the action.
    endsAtWallTime: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
  })
  .refine((form) => form.leftMemberId !== form.rightMemberId, {
    path: ["rightMemberId"],
  })

export const competitionVoteFormSchema = z.object({
  competitionId: z.string().uuid(),
  votedForMemberId: z.string().uuid(),
  reason: z.string().trim().min(1).max(200),
  // Set when the form is changing an existing vote rather than casting a new one.
  voteId: z.string().uuid().optional(),
})

export const competitionVoteIdSchema = z.string().uuid()
