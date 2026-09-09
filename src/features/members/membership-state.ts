// Where someone stands with the association, for the pages that have to ask.
//
// One function because the answer decides what a locked page offers, and "have they asked
// yet" is three tables' worth of nuance that no component should be working out for itself:
// a dismissed welcome letter is not a request, and a request that was turned down is not
// one that is still waiting.

import { findMembershipPrompt } from "@/features/members/queries"
import { isActiveMember, type Viewer } from "@/lib/permissions"

export type MembershipState =
  /** Already in. There is nothing to offer them. */
  | "member"
  /** Nobody is signed in. */
  | "signedOut"
  /** Signed in and free to ask, whether they never have or closed the letter unanswered. */
  | "canApply"
  /** Asked, and waiting on an admin. */
  | "pending"
  /** Asked and turned down. Asking again writes nothing, so nothing is offered. */
  | "denied"

/**
 * Whether the welcome letter is about to take over the screen.
 *
 * Asked by the letter itself and by anything that has to get out of its way, so the two
 * cannot disagree: it is shown to somebody signed in who is not a member and has never
 * answered it.
 */
export async function willShowWelcomeLetter(
  viewer: Viewer | null,
): Promise<boolean> {
  if (!viewer || isActiveMember(viewer)) return false

  return (await findMembershipPrompt(viewer.authUserId)) === null
}

export async function findMembershipState(
  viewer: Viewer | null,
): Promise<MembershipState> {
  if (!viewer) return "signedOut"

  // Checked before the prompt row, which outlives approval: a member who once asked still
  // has a request on file, and reading that alone would tell them they are still waiting.
  if (isActiveMember(viewer)) return "member"

  const prompt = await findMembershipPrompt(viewer.authUserId)

  if (!prompt) return "canApply"
  if (prompt.deniedAt) return "denied"

  return prompt.response === "requested" ? "pending" : "canApply"
}
