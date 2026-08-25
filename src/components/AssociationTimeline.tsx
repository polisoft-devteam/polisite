// The association's history: a spine down the middle with years on it, entries alternating
// left and right, photos in tilted piles.
//
// As you scroll, the spine fills with a gradient behind you, each year marker lights up as
// it arrives, and entries slide in from their own side. All of it is scroll-driven CSS —
// no JavaScript, no observers. Browsers without support show everything outright, which is
// the correct fallback.
//
// On a phone the spine moves to the left edge and everything stacks: alternating inside a
// narrow column is just a wobbly single column.

import { getTranslations } from "next-intl/server"

import { TimelineImageStack } from "@/components/TimelineImageStack"
import { ASSOCIATION_TIMELINE } from "@/lib/association-timeline"
import { cn } from "@/lib/utils"

export async function AssociationTimeline() {
  const translateAbout = await getTranslations("About")

  return (
    <div className="timeline relative mt-10">
      {/* The unlit spine, and the gradient that fills it as you scroll past. */}
      <div
        aria-hidden="true"
        className="bg-border absolute inset-y-0 left-3 w-0.5 sm:left-1/2 sm:-translate-x-1/2"
      >
        <div className="timeline-spine-fill from-primary to-accent h-full w-full origin-top bg-linear-to-b" />
      </div>

      <ol>
        {ASSOCIATION_TIMELINE.map((entry, index) => {
          const isRightSide = index % 2 === 1

          return (
            <li
              key={entry.id}
              className={cn(
                "timeline-entry relative pb-16 pl-10 last:pb-0 sm:pl-0",
                isRightSide ? "timeline-entry--right" : "timeline-entry--left",
              )}
            >
              <div className="absolute left-3 -translate-x-1/2 sm:left-1/2">
                <span className="timeline-marker border-border bg-background text-muted-foreground font-heading block rounded-full border-2 px-3 py-0.5 text-xs font-semibold">
                  {entry.year}
                </span>
              </div>

              <div
                className={
                  isRightSide
                    ? "sm:ml-[calc(50%+2.5rem)]"
                    : "sm:mr-[calc(50%+2.5rem)]"
                }
              >
                {entry.images && <TimelineImageStack images={entry.images} />}

                <h3 className="font-heading text-xl font-semibold tracking-tight">
                  {translateAbout(`timeline.${entry.id}.title`)}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  {translateAbout(`timeline.${entry.id}.body`)}
                </p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
