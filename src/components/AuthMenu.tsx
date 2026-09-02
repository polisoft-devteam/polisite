// The right-hand side of the header: sign in, or who you're signed in as.
//
// Your own face carries the unread count, because tapping it already goes to the profile
// where the list lives. A separate bell would have been a second thing pointing at the
// same place.
//
// Icons rather than text, with the label sliding out on hover: an email is as long as it
// likes, and one squeezed the navigation into itself. Nothing here is hidden from a screen
// reader, the labels are clipped rather than removed.
//
// A server component — it reads the session on the server, so nothing about membership
// is decided in the browser. Signing out is a server action submitted by a plain form,
// which is why this needs no client JavaScript at all.

import { getTranslations } from "next-intl/server"

import { signOut } from "@/app/auth/actions"
import { SignInButton } from "@/components/SignInButton"
import { HoverRevealLabel } from "@/components/HoverRevealLabel"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { SignOutIcon } from "@/lib/icons"
import { viewerAvatarUrl, viewerDisplayName } from "@/features/members/identity"
import { countUnseenActivity } from "@/features/notifications/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

export async function AuthMenu() {
  const translateAuth = await getTranslations("Auth")
  const translateNotifications = await getTranslations("Notifications")
  const viewer = await getViewer()

  if (!viewer) {
    return <SignInButton />
  }

  const displayName = viewerDisplayName(viewer)
  const avatarUrl = viewerAvatarUrl(viewer)

  const unseenCount = await countUnseenActivity(viewer)

  const identity = (
    <>
      <span className="relative flex">
        <MemberAvatar
          fullName={displayName}
          avatarUrl={avatarUrl}
          className="size-7 text-xs"
        />

        {unseenCount > 0 && (
          <span
            aria-label={translateNotifications("unseen", {
              count: unseenCount,
            })}
            className="bg-notification ring-background absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold text-white tabular-nums ring-2"
          >
            {unseenCount > 9 ? "9+" : unseenCount}
          </span>
        )}
      </span>
    </>
  )

  return (
    <div className="flex min-w-0 items-center gap-1">
      {isActiveMember(viewer) ? (
        <Link
          href="/profile"
          transitionTypes={["nav-forward"]}
          aria-label={displayName}
          className="hover:text-foreground text-muted-foreground group/reveal flex cursor-pointer items-center gap-1.5 rounded-md transition-colors"
        >
          <HoverRevealLabel icon={identity} label={displayName} />
        </Link>
      ) : (
        <span
          className="text-muted-foreground group/reveal flex items-center gap-1.5"
          title={displayName}
        >
          <HoverRevealLabel
            icon={identity}
            label={`${displayName} · ${translateAuth("guest")}`}
          />
        </span>
      )}

      {/* Below md this lives at the foot of the mobile menu instead, where a long email
          and a sign out button were fighting for the same few pixels. */}
      <form action={signOut} className="hidden md:block">
        <Button
          type="submit"
          variant="ghost"
          size="icon"
          aria-label={translateAuth("signOut")}
          className="group/reveal w-auto cursor-pointer px-2"
        >
          <HoverRevealLabel
            icon={<SignOutIcon className="size-4" />}
            label={translateAuth("signOut")}
          />
        </Button>
      </form>
    </div>
  )
}
