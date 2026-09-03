// The page a non-member gets where a members-only page would have been.
//
// Shown instead of a not-found, and shown for any slug at all, whether or not an event by
// that name exists. That is the point: a guest who was sent a link gets a way in, and a
// stranger guessing slugs learns nothing, because every guess answers the same.
//
// It renders nothing about the event. There is nothing here to leak.

import { getTranslations } from "next-intl/server"

import { SignInButton } from "@/components/SignInButton"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"
import { LockIcon } from "@/lib/icons"

export async function MembersOnlyNotice({
  isSignedIn,
}: {
  /** Signed in but not let in yet is a different problem from not signed in at all. */
  isSignedIn: boolean
}) {
  const translateEvents = await getTranslations("Events")

  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      <span className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-full">
        <LockIcon className="size-5" />
      </span>

      <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight">
        {translateEvents("membersOnlyTitle")}
      </h1>

      <p className="text-muted-foreground mt-2 text-sm">
        {isSignedIn
          ? translateEvents("membersOnlyPending")
          : translateEvents("membersOnlySignedOut")}
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {!isSignedIn && <SignInButton />}

        <Button
          nativeButton={false}
          variant="outline"
          size="sm"
          render={
            <Link href="/about#membership" transitionTypes={["nav-forward"]} />
          }
        >
          {translateEvents("membersOnlyReadMore")}
        </Button>
      </div>
    </div>
  )
}
