// The right-hand side of the header: sign in, or who you're signed in as.
//
// A server component — it reads the session on the server, so nothing about membership
// is decided in the browser. Signing out is a server action submitted by a plain form,
// which is why this needs no client JavaScript at all.

import { getTranslations } from "next-intl/server"

import { signOut } from "@/app/auth/actions"
import { SignInButton } from "@/components/SignInButton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

export async function AuthMenu() {
  const translateAuth = await getTranslations("Auth")
  const viewer = await getViewer()

  if (!viewer) {
    return <SignInButton />
  }

  const displayName =
    viewer.member?.nickname ?? viewer.member?.fullName ?? viewer.email
  const initials = displayName.slice(0, 2).toUpperCase()

  const identity = (
    <>
      <Avatar className="size-7">
        {viewer.member?.avatarUrl ? (
          <AvatarImage src={viewer.member.avatarUrl} alt="" />
        ) : null}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>
      <span className="hidden text-sm sm:inline">{displayName}</span>
    </>
  )

  return (
    <div className="flex items-center gap-2">
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
