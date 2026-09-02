"use server"

import { revalidatePath } from "next/cache"

import { postMembershipRequestToDiscord } from "@/features/members/discord"
import { memberNameFrom } from "@/features/members/display-name"
import { recordMembershipPrompt } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

/**
 * Both buttons on the welcome prompt land here. Recording the answer is what stops the
 * modal reappearing, and the unique key means a second click writes nothing — which is
 * what keeps the Discord ping to one per person.
 */
async function answerMembershipPrompt(response: "requested" | "dismissed") {
  const viewer = await getViewer()

  // Only signed-in non-members ever see this, so anyone else is noise.
  if (!viewer || isActiveMember(viewer)) return

  const isFirstAnswer = await recordMembershipPrompt({
    authUserId: viewer.authUserId,
    email: viewer.email,
    // What Google told us, or the part before the @: this is the only chance to
    // capture it, and it becomes their name when an admin approves them.
    fullName: memberNameFrom(viewer.googleName, viewer.email),
    response,
  })

  // Only on the first answer, so clicking twice can't ping twice.
  if (isFirstAnswer && response === "requested") {
    await postMembershipRequestToDiscord()
  }

  revalidatePath("/", "layout")
}

export async function requestMembership() {
  await answerMembershipPrompt("requested")
}

export async function dismissMembershipPrompt() {
  await answerMembershipPrompt("dismissed")
}
