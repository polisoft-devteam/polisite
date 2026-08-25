// An event as a card: the photo carries it, with the title over a gradient, how long until
// it happens, and the faces of whoever is coming.
//
// Images arrive at whatever shape the camera gave them, so every card is cropped to the
// same ratio — a grid of mixed aspect ratios reads as a mistake.

import { getFormatter, getTranslations } from "next-intl/server"

import { MemberAvatar } from "@/components/MemberAvatar"
import { SiteImage } from "@/components/SiteImage"
import { SuggestionRibbon } from "@/components/SuggestionRibbon"
import type { Event } from "@/db/schema"
import {
  EVENT_CATEGORY_ICON,
  EVENT_CATEGORY_LABEL_KEY,
} from "@/features/events/labels"
import type { Attendee } from "@/features/events/queries"
import { Link } from "@/i18n/navigation"

const MAX_FACES = 4

export async function EventCard({
  event,
  attendees,
  locale,
}: {
  event: Event
  /** Only those going — a face implies presence. */
  attendees: Attendee[]
  locale: string
}) {
  const translateEvents = await getTranslations("Events")
  const format = await getFormatter({ locale })

  const CategoryIcon = EVENT_CATEGORY_ICON[event.category]
  const shownFaces = attendees.slice(0, MAX_FACES)
  const hiddenCount = attendees.length - shownFaces.length

  return (
    <Link
      href={`/events/${event.slug}`}
      transitionTypes={["nav-forward"]}
      className="group border-border bg-card focus-visible:ring-ring/50 block overflow-hidden rounded-lg border transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:outline-none"
    >
      <div className="relative aspect-4/3 overflow-hidden">
        {event.kind === "suggestion" && <SuggestionRibbon />}
        {event.imageUrl ? (
          <SiteImage
            src={event.imageUrl}
            alt=""
            rounded=""
            className="size-full transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 22rem, (min-width: 640px) 45vw, 100vw"
          />
        ) : (
          // No photo yet — the category icon fills the space rather than a grey hole.
          <div className="from-primary/15 to-accent/15 flex size-full items-center justify-center bg-linear-to-br">
            <CategoryIcon className="text-primary/40 size-16" />
          </div>
        )}

        {/* Dark at the bottom only, so the title stays legible over any photo. */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-white/80 uppercase">
            <CategoryIcon className="size-3.5" />
            {translateEvents(EVENT_CATEGORY_LABEL_KEY[event.category])}
          </p>
          <h3 className="font-heading mt-1 text-xl leading-tight font-semibold text-balance text-white">
            {event.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          {event.startsAt ? (
            <>
              <p className="text-sm font-medium">
                {format.dateTime(event.startsAt, {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: event.timeZone,
                })}
              </p>
              <p className="text-muted-foreground text-xs">
                {/* Counts down while it's ahead, and reads "för 3 dagar sedan" after. */}
                {format.relativeTime(event.startsAt)}
              </p>
            </>
          ) : (
            <p className="text-muted-foreground text-sm italic">
              {translateEvents("dateNotDecided")}
            </p>
          )}
        </div>

        {attendees.length > 0 && (
          <div className="flex shrink-0 items-center">
            {shownFaces.map((attendee) => (
              <MemberAvatar
                key={attendee.memberId}
                fullName={attendee.fullName}
                avatarUrl={attendee.avatarUrl}
                className="ring-card -ml-2 size-7 text-[10px] ring-2 first:ml-0"
              />
            ))}
            {hiddenCount > 0 && (
              <span className="bg-muted text-muted-foreground ring-card -ml-2 flex size-7 items-center justify-center rounded-full text-[10px] font-medium ring-2">
                +{hiddenCount}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  )
}
