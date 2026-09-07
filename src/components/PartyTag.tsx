// The party the wheel gave you, worn next to your title.
//
// Only ever on your own profile: the pick lives in this browser, so on anyone else's page
// it would be your party under their name. And only until election day, like the wheel and
// like the short form after your name. It is rendered in the party's own colours
// rather than the site's, because a party tag in the brand palette says nothing.

"use client"

import { Badge } from "@/components/ui/badge"
import { isElectionOpen } from "@/lib/election"
import { useElectionWheelState } from "@/lib/election-store"

export function PartyTag() {
  const { party } = useElectionWheelState()

  if (!party || !isElectionOpen()) return null

  return (
    <Badge style={{ backgroundColor: party.color, color: party.textColor }}>
      {party.name}
    </Badge>
  )
}
