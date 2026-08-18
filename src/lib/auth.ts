// Who is looking at the page? Every permission decision starts here.
//
// The key distinction, from CLAUDE.md: signing in with Google makes someone a *user*.
// Being a *member* requires a row in `members` with status "active". A signed-in
// non-member sees only public content.

import { findMemberByAuthUserId } from "@/features/members/queries"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Member } from "@/db/schema"

export type Viewer = {
  authUserId: string
  email: string
  /** Null when someone has signed in with Google but has no member row yet. */
  member: Member | null
}

/** Returns null for signed-out visitors. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createSupabaseServerClient()

  // getUser() revalidates the token with Supabase. Never trust getSession() for this —
  // it reads the cookie without verifying it.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  return {
    authUserId: user.id,
    email: user.email,
    member: await findMemberByAuthUserId(user.id),
  }
}

export function isActiveMember(viewer: Viewer | null): boolean {
  return viewer?.member?.status === "active"
}
