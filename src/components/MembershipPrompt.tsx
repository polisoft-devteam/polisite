// Shown once to someone who has signed in with Google but isn't a member: a letter from a
// founder, and the chance to ask to join.
//
// Asking is what stops it coming back. Closing with the X leaves the question open, so it
// returns next visit. To read the letter without signing out, it is on /design.

import { Modal } from "@/components/Modal"
import { WelcomeCrawl } from "@/components/WelcomeCrawl"
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"
import { WELCOME_LETTER } from "@/lib/welcome-letter"

export async function MembershipPrompt() {
  const viewer = await getViewer()

  if (!viewer || isActiveMember(viewer)) return null

  // Answered already — never show it again.
  if (await findMembershipPrompt(viewer.authUserId)) return null

  return (
    <Modal
      defaultOpen
      title={WELCOME_LETTER.title}
      closeLabel={WELCOME_LETTER.closeLabel}
      className="sm:max-w-2xl"
      backgroundImage="/images/misc/viggeRasse.webp"
      titleClassName="text-center text-xl font-extrabold tracking-tight sm:text-2xl"
      footer={
        <form action={requestMembership}>
          <Button type="submit">{WELCOME_LETTER.requestLabel}</Button>
        </form>
      }
    >
      <WelcomeCrawl
        paragraphs={WELCOME_LETTER.paragraphs}
        signature={WELCOME_LETTER.signature}
        pauseLabel={WELCOME_LETTER.pauseLabel}
        playLabel={WELCOME_LETTER.playLabel}
        replayLabel={WELCOME_LETTER.replayLabel}
      />
    </Modal>
  )
}
