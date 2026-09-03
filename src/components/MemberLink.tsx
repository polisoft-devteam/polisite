// A member, wherever one is shown: their picture, their name, linking to their profile.
//
// One component because the header, the members table, the attendee list and the host line
// were each assembling this themselves and disagreeing about the same person, one showing
// a name where another showed an address.
//
// The name rule lives in features/members/identity.ts. The picture is whatever is stored
// on the row: only their own session can see their Google picture, which is why signing in
// writes it to the row rather than leaving everyone else looking at initials.

import { MemberAvatar } from "@/components/MemberAvatar"
import { memberDisplayName } from "@/features/members/identity"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"

export type LinkableMember = {
  id: string
  fullName: string
  nickname: string | null
  email: string
  avatarUrl: string | null
}

export function MemberLink({
  member,
  size = "default",
  secondaryLine,
  className,
}: {
  member: LinkableMember
  size?: "sm" | "default" | "lg"
  /** A badge, a response, whatever belongs under the name. */
  secondaryLine?: React.ReactNode
  className?: string
}) {
  const avatarSize =
    size === "lg"
      ? "size-10"
      : size === "sm"
        ? "size-6 text-[0.625rem]"
        : "size-7 text-xs"

  return (
    <Link
      href={`/members/${member.id}`}
      transitionTypes={["nav-forward"]}
      // data-sweep is what globals.css keys the fill on, so a row fills exactly as a
      // button does rather than approximating it here.
      data-slot="button"
      data-sweep="true"
      className={cn(
        "[--button-accent-foreground:var(--color-primary-foreground)] [--button-accent:var(--color-primary)]",
        "flex min-w-0 items-center gap-2 rounded-md px-2 py-1",
        className,
      )}
    >
      <MemberAvatar
        fullName={memberDisplayName(member)}
        avatarUrl={member.avatarUrl}
        className={avatarSize}
      />

      <span className="min-w-0">
        <span
          className={cn(
            "block truncate",
            size === "sm" ? "text-sm" : "text-sm font-medium",
          )}
        >
          {memberDisplayName(member)}
        </span>
        {secondaryLine}
      </span>
    </Link>
  )
}
