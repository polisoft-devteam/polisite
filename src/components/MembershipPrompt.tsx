// Shown once to someone who has signed in with Google but isn't a member: a letter from a
// founder, and the chance to ask to join.
//
// Once really means once now. It used to return on every visit until they answered it,
// which turned a welcome into a nag; the browser remembers having shown it, keyed to the
// account it was shown to. A guest who wants it again presses the button in the hero.
//
// The letter itself is WelcomeLetterModal, which /welcome renders too, so it can be read
// without signing out.

import { WelcomeLetterModal } from "@/components/WelcomeLetterModal"
import { willShowWelcomeLetter } from "@/features/members/membership-state"
import { getViewer } from "@/lib/auth"

export async function MembershipPrompt() {
  const viewer = await getViewer()

  // The one question, asked in one place; see willShowWelcomeLetter.
  if (!(await willShowWelcomeLetter(viewer))) return null

  return <WelcomeLetterModal seenKey={viewer!.authUserId} />
}
