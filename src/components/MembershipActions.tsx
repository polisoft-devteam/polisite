// What someone can do about their membership, given where they stand.
//
// Shared by the locked page a Discord link lands on and the membership section of About,
// which is where that page sends people: arriving at the explanation with nothing to press
// is how someone who wants in gives up.

import { getTranslations } from "next-intl/server"

import { SignInButton } from "@/components/SignInButton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import type { MembershipState } from "@/features/members/membership-state"
import { PendingIcon } from "@/lib/icons"

export async function MembershipActions({ state }: { state: MembershipState }) {
  const translateEvents = await getTranslations("Events")

  // A member has nothing to ask for, and someone turned down has nothing to ask again:
  // the request is already on file, so the button would write nothing.
  if (state === "member" || state === "denied") return null

  if (state === "signedOut") return <SignInButton />

  if (state === "pending") {
    return (
      <Badge variant="secondary">
        <PendingIcon className="size-3" />
        {translateEvents("membersOnlyPendingPill")}
      </Badge>
    )
  }

  return (
    <form action={requestMembership}>
      <Button type="submit">{translateEvents("membersOnlyApply")}</Button>
    </form>
  )
}
