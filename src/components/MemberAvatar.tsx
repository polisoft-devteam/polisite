// A member's picture.
//
// The grey disc is on the root rather than only in the fallback because Base UI decides
// between image and fallback on the client, after hydration — so without it the circle is
// blank on first paint and the photo pops in.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

/** "Victor Persson" → "VP". Falls back to the first two letters of a single name. */
function toInitials(fullName: string): string {
  const words = fullName.trim().split(/\s+/).filter(Boolean)

  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()

  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}

export function MemberAvatar({
  fullName,
  avatarUrl,
  className,
}: {
  fullName: string
  avatarUrl: string | null
  className?: string
}) {
  return (
    <Avatar className={cn("bg-muted", className)}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt="" />}
      <AvatarFallback>{toInitials(fullName)}</AvatarFallback>
    </Avatar>
  )
}
