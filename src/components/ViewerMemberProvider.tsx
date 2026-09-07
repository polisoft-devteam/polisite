// Who is signed in, for the handful of client components that have to recognise their own
// name in a list they did not build.
//
// Only the id, and only so a browser-held thing like the election tag can be shown beside
// your own name and nobody else's. It decides nothing: every permission is read on the
// server, and an id is already public to any member.

"use client"

import { createContext, useContext } from "react"

const ViewerMemberContext = createContext<string | null>(null)

export function ViewerMemberProvider({
  memberId,
  children,
}: {
  memberId: string | null
  children: React.ReactNode
}) {
  return <ViewerMemberContext value={memberId}>{children}</ViewerMemberContext>
}

/** Null for a guest, and on any page rendered without the provider. */
export function useViewerMemberId(): string | null {
  return useContext(ViewerMemberContext)
}
