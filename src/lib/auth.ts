// Who is looking at the page? Every permission decision starts here.

import { cache } from "react"

import { findMemberByAuthUserId } from "@/features/members/queries"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Member } from "@/db/schema"

export type Viewer = {
  authUserId: string
  email: string
  /** Null for a signed-in guest — someone with a Google account but no membership. */
  member: Member | null
}

/**
 * Returns null for signed-out visitors.
 *
 * cache() dedupes this per request — the layout, the page and the header all ask, and
 * each call would otherwise cost a Supabase round trip plus a database query.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient()

  // getUser() revalidates the token; getSession() only reads the cookie and is not safe here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  return {
    authUserId: user.id,
    email: user.email,
    member: await findMemberByAuthUserId(user.id),
  }
})

export function isActiveMember(viewer: Viewer | null): boolean {
  return viewer?.member?.status === "active"
}
