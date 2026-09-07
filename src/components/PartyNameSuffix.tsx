// The short form of your party after your own name: Victor Persson (L).
//
// Only your own name, wherever it appears, because the pick lives in this browser and on
// somebody else's row it would be your party under their name. Given a member id it checks
// against the signed-in one; without it the caller has already established whose name this
// is. Only while the election is on: afterwards a name is a name again.

"use client"

import { useViewerMemberId } from "@/components/ViewerMemberProvider"
import { isElectionOpen } from "@/lib/election"
import { useElectionWheelState } from "@/lib/election-store"

export function PartyNameSuffix({ memberId }: { memberId?: string }) {
  const { party } = useElectionWheelState()
  const viewerMemberId = useViewerMemberId()

  if (memberId && memberId !== viewerMemberId) return null
  if (!party || !isElectionOpen()) return null

  return <span className="text-muted-foreground"> ({party.abbreviation})</span>
}
