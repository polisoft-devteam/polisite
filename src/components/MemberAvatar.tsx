// A member's picture, with a pulsing skeleton underneath while it loads.
// Plain elements rather than ui/avatar: Base UI renders nothing until hydration, so the
// photo popped in from an empty circle.

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
    <span
      className={cn(
        "bg-muted relative inline-flex size-8 shrink-0 overflow-hidden rounded-full",
        className,
      )}
    >
      {avatarUrl ? (
        <>
          <span
            aria-hidden="true"
            className="bg-muted-foreground/20 absolute inset-0 animate-pulse"
          />
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image needs
              remotePatterns per host; wire that up with the upload in step 2.2. */}
          <img
            src={avatarUrl}
            alt=""
            decoding="async"
            className="absolute inset-0 size-full object-cover"
          />
        </>
      ) : (
        <span className="text-muted-foreground flex size-full items-center justify-center font-medium">
          {toInitials(fullName)}
        </span>
      )}
    </span>
  )
}
