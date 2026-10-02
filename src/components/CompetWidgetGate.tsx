// Who is offered the duel in the corner: members, while a duel is running.
//
// Members only, like /compet itself: the faces in it are members'. It sits in the locale
// layout so it follows you around the site, the way the election wheel did.

import { CompetWidget } from "@/components/CompetWidget"
import { findOpenCompetitions } from "@/features/compet/queries"
import { willShowWelcomeLetter } from "@/features/members/membership-state"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

export async function CompetWidgetGate() {
  const viewer = await getViewer()
  if (!isActiveMember(viewer)) return null

  // The welcome letter takes the whole screen; nothing else asks for attention beside it.
  if (await willShowWelcomeLetter(viewer)) return null

  const competitions = await findOpenCompetitions()
  if (competitions.length === 0) return null

  return <CompetWidget competitions={competitions} />
}
