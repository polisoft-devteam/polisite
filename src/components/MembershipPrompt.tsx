// Shown once to someone who has signed in with Google but isn't a member: a letter from a
// founder, and the chance to ask to join. Either button dismisses it for good.

import { Modal, ModalClose } from "@/components/Modal"
import { WelcomeCrawl } from "@/components/WelcomeCrawl"
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { findMembershipPrompt } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"
import { WELCOME_LETTER } from "@/lib/welcome-letter"

/**
 * TEMPORARY, REMOVE BEFORE RELEASE.
 *
 * While the letter is being written it reopens on every page load, for anyone signed in.
 * Set back to false and the letter goes back to appearing once, to a signed-in guest who
 * has not answered yet. Tracked in README under "Before release".
 */
const ALWAYS_SHOW_WELCOME_LETTER = true

export async function MembershipPrompt() {
  const viewer = await getViewer()

  if (!viewer) return null

  if (!ALWAYS_SHOW_WELCOME_LETTER) {
    if (isActiveMember(viewer)) return null

    // Answered already — never show it again.
    if (await findMembershipPrompt(viewer.authUserId)) return null
  }

  return (
    <Modal
      defaultOpen
      title={WELCOME_LETTER.title}
      closeLabel={WELCOME_LETTER.closeLabel}
      className="sm:max-w-2xl"
      backgroundImage="/images/misc/viggeRasse.webp"
      titleClassName="text-center text-xl font-extrabold tracking-tight sm:text-2xl"
      footer={
        // An active member is only here because of the flag above, and asking to join
        // something you are already in does nothing: the action refuses it. So for them
        // the button closes the letter instead of submitting into a dead end.
        isActiveMember(viewer) ? (
          <ModalClose render={<Button />}>
            {WELCOME_LETTER.closeLabel}
          </ModalClose>
        ) : (
          <form action={requestMembership}>
            <Button type="submit">{WELCOME_LETTER.requestLabel}</Button>
          </form>
        )
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
