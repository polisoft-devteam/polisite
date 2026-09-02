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

  // Google puts these in user_metadata under either key depending on the account. They
  // were being discarded, which is why a new member ended up named after their address.
  const metadata = user.user_metadata ?? {}

  return {
    authUserId: user.id,
    email: user.email,
    googleName:
      (metadata.full_name as string | undefined) ??
      (metadata.name as string | undefined) ??
      null,
    googleAvatarUrl:
      (metadata.avatar_url as string | undefined) ??
      (metadata.picture as string | undefined) ??
      null,
    member,
    roles: member ? await findRolesForMember(member.id) : [],
  }
})
