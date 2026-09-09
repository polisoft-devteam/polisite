// What a non-member is told when they press something they cannot open.
//
// The same panel behind an event card, a calendar tile and a locked album, so the answer
// is one answer wherever it is met, in one place to change. It says nothing about the
// thing that was pressed: a members-only event and a slug somebody guessed have to look
// alike, or the guess becomes an answer.
//
// The full-page version of this is MembersOnlyNotice, which can also offer to put the
// request in, because a page can read whether they have asked already and a modal cannot.

import { SiteImage } from "@/components/SiteImage"
import { Button } from "@/components/ui/button"
import { Link } from "@/i18n/navigation"

export function MembersOnlyPanel({
  body,
  readMoreLabel,
}: {
  body: string
  readMoreLabel: string
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {/* The knight, since somebody has to be standing at the gate. Cropped from the
          upper part: the picture is a portrait and a circle would take his head off. */}
      <SiteImage
        src="/images/misc/viggeKnight.webp"
        alt=""
        rounded="rounded-full"
        focalPoint="upper"
        className="ring-border size-40 ring-2"
        sizes="160px"
      />

      <p className="text-muted-foreground mt-4 text-sm text-balance">{body}</p>

      <Button
        nativeButton={false}
        variant="outline"
        size="sm"
        className="mt-4"
        render={
          <Link href="/about#membership" transitionTypes={["nav-forward"]} />
        }
      >
        {readMoreLabel}
      </Button>
    </div>
  )
}
