// Shown once to someone who has signed in with Google but isn't a member: a letter from a
// founder, and the chance to ask to join. Either button dismisses it for good.

import { getTranslations } from "next-intl/server"

import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"
import {
  dismissMembershipPrompt,
  requestMembership,
} from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

export async function MembershipPrompt() {
  const viewer = await getViewer()

  if (!viewer || isActiveMember(viewer)) return null

  // Answered already — never show it again.
  if (await findMembershipPrompt(viewer.authUserId)) return null

  const translateMembership = await getTranslations("MembershipPrompt")
  const paragraphs = translateMembership.raw("paragraphs") as string[]

  return (
    <Modal
      defaultOpen
      title={translateMembership("title")}
      closeLabel={translateMembership("close")}
      className="sm:max-w-2xl"
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
      {/* Scrolls rather than growing past the viewport — it's a long letter. */}
      <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 text-sm leading-relaxed">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <p className="text-muted-foreground pt-2 italic">
          {translateMembership("signature")}
        </p>
      </div>
    </Modal>
  )
}
