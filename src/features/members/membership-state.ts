// Where someone stands with the association, for the pages that have to ask.
//
// One function because the answer decides what a locked page offers, and "have they asked
// yet" is three tables' worth of nuance that no component should be working out for itself:
// a dismissed welcome letter is not a request, and a request that was turned down is not
// one that is still waiting.

import { findMembershipPrompt } from "@/features/members/queries"
import type { Viewer } from "@/lib/permissions"

export type MembershipState =
  /** Nobody is signed in. */
  | "signedOut"
  /** Signed in and free to ask, whether they never have or closed the letter unanswered. */
  | "canApply"
  /** Asked, and waiting on an admin. */
  | "pending"
  /** Asked and turned down. Asking again writes nothing, so nothing is offered. */
  | "denied"

export async function findMembershipState(
  viewer: Viewer | null,
): Promise<MembershipState> {
  if (!viewer) return "signedOut"

  const prompt = await findMembershipPrompt(viewer.authUserId)

  if (!prompt) return "canApply"
  if (prompt.deniedAt) return "denied"

  return prompt.response === "requested" ? "pending" : "canApply"
}
