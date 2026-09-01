// The right-hand side of the header: sign in, or who you're signed in as.
//
// Your own face carries the unread count, because tapping it already goes to the profile
// where the list lives. A separate bell would have been a second thing pointing at the
// same place.
//
// A server component — it reads the session on the server, so nothing about membership
// is decided in the browser. Signing out is a server action submitted by a plain form,
// which is why this needs no client JavaScript at all.

import { getTranslations } from "next-intl/server"

import { signOut } from "@/app/auth/actions"
import { SignInButton } from "@/components/SignInButton"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
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

  const displayName =
    viewer.member?.nickname ?? viewer.member?.fullName ?? viewer.email

  const unseenCount = await countUnseenActivity(viewer)

  const identity = (
    <>
      <span className="relative flex">
        <MemberAvatar
          fullName={viewer.member?.fullName ?? viewer.email}
          avatarUrl={viewer.member?.avatarUrl ?? null}
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

      <span className="hidden text-sm sm:inline">{displayName}</span>
    </>
  )

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {isActiveMember(viewer) ? (
        <Link
          href="/profile"
          transitionTypes={["nav-forward"]}
          className="hover:text-foreground text-muted-foreground flex items-center gap-2 rounded-md transition-colors"
        >
          {identity}
        </Link>
      ) : (
        <div className="text-muted-foreground flex items-center gap-2">
          {identity}
          <span className="hidden text-xs sm:inline">
            {translateAuth("guest")}
          </span>
        </div>
      )}

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          {translateAuth("signOut")}
        </Button>
      </form>
    </div>
  )
}
