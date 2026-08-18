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
import { getViewer, isActiveMember } from "@/lib/auth"

export async function AuthMenu() {
  const translateAuth = await getTranslations("Auth")
  const viewer = await getViewer()

  if (!viewer) {
    return <SignInButton />
  }

  const displayName = viewer.member?.fullName ?? viewer.email
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <Avatar className="size-7">
        {viewer.member?.avatarUrl ? (
          <AvatarImage src={viewer.member.avatarUrl} alt="" />
        ) : null}
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      {!isActiveMember(viewer) && (
        <span className="text-muted-foreground hidden text-xs sm:inline">
          {translateAuth("guest")}
        </span>
      )}

      <form action={signOut}>
        <Button type="submit" variant="ghost" size="sm">
          {translateAuth("signOut")}
        </Button>
      </form>
    </div>
  )
}
