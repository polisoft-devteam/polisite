// The association's history as a vertical timeline: a line down the middle with years on
// it, entries alternating left and right.
//
// On a phone the line moves to the left edge and everything stacks — an alternating layout
// in a narrow column is just a wobbly single column.
//
// Entries fade up as they come into view using a scroll-driven CSS animation, so there's no
// JavaScript and no observer. Browsers without support simply show them, which is the
// correct fallback.

import { getTranslations } from "next-intl/server"

import { SiteImage } from "@/components/SiteImage"
import { ASSOCIATION_TIMELINE } from "@/lib/association-timeline"

export async function AssociationTimeline() {
  const translateAbout = await getTranslations("About")

  return (
    <ol className="relative mt-10">
      {/* The spine. Left-aligned on mobile, centred once there's room for two columns. */}
      <div
        aria-hidden="true"
        className="via-border absolute inset-y-0 left-3 w-px bg-linear-to-b from-transparent to-transparent sm:left-1/2 sm:-translate-x-1/2"
      />

      {ASSOCIATION_TIMELINE.map((entry, index) => {
        const isRightSide = index % 2 === 1

        return (
          <li
            key={entry.id}
            className="timeline-entry relative pb-14 pl-10 last:pb-0 sm:pl-0"
          >
            {/* Year marker, sitting on the spine. */}
            <div className="absolute left-3 -translate-x-1/2 sm:left-1/2">
              <span className="border-primary bg-background text-primary font-heading block rounded-full border-2 px-3 py-0.5 text-xs font-semibold">
                {entry.year}
              </span>
            </div>

            <div
              className={
                isRightSide
                  ? "sm:ml-[calc(50%+2.5rem)]"
                  : "sm:mr-[calc(50%+2.5rem)] sm:text-right"
              }
            >
              {entry.imageUrl && (
                <SiteImage
                  src={entry.imageUrl}
                  alt=""
                  className="mb-4 aspect-16/10 w-full"
                  sizes="(min-width: 640px) 28rem, 100vw"
                />
              )}

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
  )
}
