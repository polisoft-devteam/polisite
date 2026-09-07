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
import { getViewer } from "@/lib/auth"
import {
  isElectionOpen,
  SPINS_SIGNED_IN,
  SPINS_SIGNED_OUT,
} from "@/lib/election"
import { isActiveMember } from "@/lib/permissions"

export async function ElectionWheelGate() {
  if (!isElectionOpen()) return null

  const viewer = await getViewer()

  const identity = isActiveMember(viewer)
    ? `member:${viewer!.member!.id}`
    : viewer
      ? "signedIn"
      : "guest"

  return (
    <ElectionWheel
      identity={identity}
      maxSpins={viewer ? SPINS_SIGNED_IN : SPINS_SIGNED_OUT}
      isSignedOut={!viewer}
    />
  )
}
