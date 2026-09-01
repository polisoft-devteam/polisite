// Shown once to someone who has signed in with Google but isn't a member: a letter from a
// founder, and the chance to ask to join. Either button dismisses it for good.

import { Modal } from "@/components/Modal"
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
      footer={
        <form action={requestMembership}>
          <Button type="submit">{WELCOME_LETTER.requestLabel}</Button>
        </form>
      }
    >
      {/* A dark screen for the crawl to recede into, with Vigge showing through. */}
      <div className="crawl-stage rounded-lg bg-black/70 px-6">
        <div className="crawl-tilt">
          <div className="crawl-text space-y-4 text-sm leading-relaxed">
            {WELCOME_LETTER.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p className="pt-2 whitespace-pre-line italic">
              {WELCOME_LETTER.signature}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
