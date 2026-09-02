// What to call someone, and which picture to show, wherever they appear.
//
// A member row wins, except when it holds nothing better than their address: a row created
// before Google's name was captured still says "someone@gmail.com", and that should not
// beat the name Google is handing us on this very request. A guest has no row at all, so
// everything comes from Google.
//
// One place, because the header, the profile and the members table were each deciding it
// slightly differently and disagreeing about the same person.

import { memberNameFrom } from "@/features/members/display-name"
import type { Viewer } from "@/lib/permissions"

/** True when the stored name is only the address, so Google's is better. */
function isPlaceholderName(fullName: string, email: string): boolean {
  return fullName === email || fullName === email.split("@")[0]
}

/**
 * What to call any member, from their row alone.
 *
 * Used wherever someone other than the viewer is shown, where there is no Google session
 * to fall back to. A row that still holds only the address becomes the part before the @,
 * which is a name of sorts, rather than the whole address, which is not.
 */
export function memberDisplayName(member: {
  nickname: string | null
  fullName: string
  email: string
}): string {
  if (member.nickname) return member.nickname
  if (!isPlaceholderName(member.fullName, member.email)) return member.fullName

  return memberNameFrom(null, member.email)
}

export function viewerDisplayName(viewer: Viewer): string {
  const member = viewer.member

  if (member?.nickname) return member.nickname

  if (member && !isPlaceholderName(member.fullName, member.email)) {
    return member.fullName
  }

  return memberNameFrom(viewer.googleName, viewer.email)
}

export function viewerAvatarUrl(viewer: Viewer): string | null {
  return viewer.member?.avatarUrl ?? viewer.googleAvatarUrl
}
