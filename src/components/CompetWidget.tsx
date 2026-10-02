// The running duel in the corner of every page, as the election wheel was: two faces, the
// question, and a way to /compet. A tab on its edge pushes it aside.
//
// Pushed aside is remembered per duel in this browser, so a new duel comes back out on
// its own. Read through useSyncExternalStore rather than an effect, which the React
// compiler refuses to let set state; the server's answer is "unknown", which draws
// nothing, so a tucked widget never flashes open on load.

"use client"

import { useSyncExternalStore } from "react"
import { useTranslations } from "next-intl"

import { MemberAvatar } from "@/components/MemberAvatar"
import { NavigationSpinner } from "@/components/NavigationSpinner"
import { Button } from "@/components/ui/button"
import type { CurrentCompetition } from "@/features/compet/queries"
import { Link, usePathname } from "@/i18n/navigation"
import { ChevronLeftIcon, ChevronRightIcon, SportIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

const STORAGE_KEY = "polisite:compet-widget-tucked"
const TUCK_EVENT = "polisite:compet-widget-tucked"

function readTuckedDuelId(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function writeTuckedDuelId(duelId: string | null) {
  try {
    if (duelId) window.localStorage.setItem(STORAGE_KEY, duelId)
    else window.localStorage.removeItem(STORAGE_KEY)
  } catch {}

  // The storage event only reaches other tabs, so this one is told directly.
  window.dispatchEvent(new Event(TUCK_EVENT))
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange)
  window.addEventListener(TUCK_EVENT, onChange)

  return () => {
    window.removeEventListener("storage", onChange)
    window.removeEventListener(TUCK_EVENT, onChange)
  }
}

/** Undefined on the server, which is "not known yet" rather than "not tucked". */
function useTuckedDuelId(): string | null | undefined {
  return useSyncExternalStore(subscribe, readTuckedDuelId, () => undefined)
}

export function CompetWidget({
  competitions,
}: {
  /** The duels still open, newest first. */
  competitions: CurrentCompetition[]
}) {
  const translateCompet = useTranslations("Compet")
  const currentPathname = usePathname()
  const tuckedDuelId = useTuckedDuelId()

  const [newest] = competitions

  // The page itself is the bigger version of this.
  if (!newest || currentPathname === "/compet") return null
  if (tuckedDuelId === undefined) return null

  const isTucked = tuckedDuelId === newest.id
  const moreCount = competitions.length - 1

  return (
    // The same corner the wheel used: flush with a phone's bottom edge, and clear of the
    // floating menu button that shows between sm and md.
    <div className="pointer-events-none fixed right-0 bottom-0 z-[55] pb-[env(safe-area-inset-bottom)] sm:right-4 sm:bottom-[calc(5.5rem+env(safe-area-inset-bottom))] md:bottom-[calc(1rem+env(safe-area-inset-bottom))]">
      <div
        className={cn(
          "flex items-center gap-1 transition-transform duration-700 ease-in-out motion-reduce:transition-none",
          isTucked && "translate-x-[calc(100%-2.75rem)]",
        )}
      >
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="bg-card pointer-events-auto shrink-0 rounded-full shadow-sm"
          aria-label={translateCompet(isTucked ? "widgetShow" : "widgetHide")}
          onClick={() => writeTuckedDuelId(isTucked ? null : newest.id)}
        >
          {isTucked ? (
            <ChevronLeftIcon className="size-3" />
          ) : (
            <ChevronRightIcon className="size-3" />
          )}
        </Button>

        <div
          className="bg-card pointer-events-auto w-64 space-y-3 rounded-2xl border p-4 shadow-lg"
          // Out of reach while it is off the edge, so a keyboard doesn't tab into it.
          inert={isTucked}
        >
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {moreCount > 0
              ? translateCompet("widgetEyebrowMany", {
                  count: competitions.length,
                })
              : translateCompet("widgetEyebrow")}
          </p>

          <div className="flex items-center justify-center gap-3">
            <MemberAvatar
              fullName={newest.left.displayName}
              avatarUrl={newest.left.avatarUrl}
              className="ring-compet-left size-12 ring-3"
            />
            <span className="font-heading text-lg font-extrabold">
              {translateCompet("versus")}
            </span>
            <MemberAvatar
              fullName={newest.right.displayName}
              avatarUrl={newest.right.avatarUrl}
              className="ring-compet-right size-12 ring-3"
            />
          </div>

          <p className="font-heading line-clamp-2 text-center font-bold text-balance">
            {newest.question}
          </p>

          <Button
            nativeButton={false}
            className="w-full"
            render={<Link href={`/compet?duel=${newest.id}`} />}
          >
            <SportIcon className="size-4" />
            {translateCompet("widgetCta")}
            <NavigationSpinner className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
