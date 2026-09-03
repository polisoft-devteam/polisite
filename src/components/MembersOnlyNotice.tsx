// The page a non-member gets where a members-only page would have been.
//
// Shown instead of a not-found, and shown for any slug at all, whether or not an event by
// that name exists. That is the point: a guest who was sent a link gets a way in, and a
// stranger guessing slugs learns nothing, because every guess answers the same.
//
// It renders nothing about the event. There is nothing here to leak.
//
// What it offers depends on how far along they are: a way to sign in, a way to ask, or
// word that they have asked and it is with an admin now.

import { getTranslations } from "next-intl/server"

import { SignInButton } from "@/components/SignInButton"
import { SiteImage } from "@/components/SiteImage"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { MembershipState } from "@/features/members/membership-state"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { Link } from "@/i18n/navigation"
import { PendingIcon } from "@/lib/icons"

export async function MembersOnlyNotice({ state }: { state: MembershipState }) {
  const translateEvents = await getTranslations("Events")

  return (
    <div className="mx-auto mt-16 max-w-md text-center">
      {/* The knight, since somebody has to be standing at the gate. Cropped from the
          upper part: the picture is a portrait and a circle would take his head off. */}
      <div className="mx-auto w-fit">
        <SiteImage
          src="/images/misc/viggeKnight.webp"
          alt=""
          rounded="rounded-full"
          focalPoint="upper"
          className="ring-border size-28 ring-2"
          sizes="112px"
        />
      </div>

      <h1 className="font-heading mt-4 text-2xl font-bold tracking-tight">
        {translateEvents("membersOnlyTitle")}
      </h1>

      <p className="text-muted-foreground mt-2 text-sm">
        {translateEvents("membersOnlyBody")}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        {state === "signedOut" && <SignInButton />}

        {state === "canApply" && (
          <form action={requestMembership}>
            <Button type="submit">{translateEvents("membersOnlyApply")}</Button>
          </form>
        )}

        {/* Nothing to press: it is with an admin, and pressing again would write nothing. */}
        {state === "pending" && (
          <Badge variant="secondary">
            <PendingIcon className="size-3" />
            {translateEvents("membersOnlyPendingPill")}
          </Badge>
        )}

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
