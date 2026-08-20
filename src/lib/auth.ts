// Who is looking at the page? Every permission decision starts from getViewer().
// The rules themselves live in permissions.ts.

import { cache } from "react"

import {
  findMemberByAuthUserId,
  findRolesForMember,
} from "@/features/members/queries"
import type { Viewer } from "@/lib/permissions"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export type { Viewer } from "@/lib/permissions"

/**
 * Returns null for signed-out visitors.
 *
 * cache() dedupes this per request — the layout, the page and the header all ask, and
 * each call would otherwise cost a Supabase round trip plus database queries.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  const supabase = await createSupabaseServerClient()

  // getUser() revalidates the token; getSession() only reads the cookie and is not safe here.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) return null

  const member = await findMemberByAuthUserId(user.id)

  return {
    authUserId: user.id,
    email: user.email,
    member,
    roles: member ? await findRolesForMember(member.id) : [],
  }
})
