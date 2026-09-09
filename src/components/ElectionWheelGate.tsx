// Who is offered the election wheel, and until when.
//
// Anyone, signed in or not: it is a fairground wheel, not a members' room. What differs is
// where the result can be worn, and that is the profile's business rather than this one's.
//
// The one thing decided here is who the browser belongs to, because signing in or being
// let into the association hands the wheel to somebody new, and somebody new starts over:
// one spin for a passer by, three once there is an account behind it. Read on the server,
// like everything else about who you are.
//
// It sits in the locale layout so it follows you around the site.

import { ElectionWheel } from "@/components/ElectionWheel"
import { recordElectionPickAction } from "@/features/election/actions"
import { viewerAvatarUrl, viewerDisplayName } from "@/features/members/identity"
import { willShowWelcomeLetter } from "@/features/members/membership-state"
import { getViewer } from "@/lib/auth"
import { isElectionOpen, SPINS_ON_FIRST_DAY } from "@/lib/election"
import { isActiveMember } from "@/lib/permissions"

export async function ElectionWheelGate() {
  if (!isElectionOpen()) return null

  const viewer = await getViewer()

  // The welcome letter takes the whole screen and asks one thing. A fairground wheel
  // spinning behind it is not a second thing worth asking.
  if (await willShowWelcomeLetter(viewer)) return null

  const identity = isActiveMember(viewer)
    ? `member:${viewer!.member!.id}`
    : viewer
      ? "signedIn"
      : "guest"

  return (
    <ElectionWheel
      identity={identity}
      maxSpins={SPINS_ON_FIRST_DAY}
      isSignedOut={!viewer}
      // Their own face under the result, so the party lands on somebody rather than in
      // the air. Nothing to show for a visitor who has not signed in.
      viewerName={viewer ? viewerDisplayName(viewer) : null}
      viewerAvatarUrl={viewer ? viewerAvatarUrl(viewer) : null}
      // A member's result joins the tally on /election; a visitor's stays in their
      // browser, because there is no row to hang it on.
      recordPick={isActiveMember(viewer) ? recordElectionPickAction : undefined}
    />
  )
}
