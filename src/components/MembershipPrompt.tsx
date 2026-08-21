// Shown once to someone who has signed in with Google but isn't a member: what this site
// is, and that they can ask to join. Either button dismisses it for good.

import { getTranslations } from "next-intl/server"

import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"
import {
  dismissMembershipPrompt,
  requestMembership,
} from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { ASSOCIATION_NAME } from "@/lib/association"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

export async function MembershipPrompt() {
  const viewer = await getViewer()

  if (!viewer || isActiveMember(viewer)) return null

  // Answered already — never show it again.
  if (await findMembershipPrompt(viewer.authUserId)) return null

  const translateMembership = await getTranslations("MembershipPrompt")

  return (
    <Modal
      defaultOpen
      title={translateMembership("title", {
        associationName: ASSOCIATION_NAME,
      })}
      closeLabel={translateMembership("close")}
      footer={
        <>
          <form action={dismissMembershipPrompt}>
            <Button type="submit" variant="outline">
              {translateMembership("dismiss")}
            </Button>
          </form>

          <form action={requestMembership}>
            <Button type="submit">{translateMembership("request")}</Button>
          </form>
        </>
      }
    >
      <div className="text-muted-foreground space-y-3 text-sm">
        <p>
          {translateMembership("intro", { associationName: ASSOCIATION_NAME })}
        </p>
        <p>{translateMembership("guestExplanation")}</p>
      </div>
    </Modal>
  )
}
