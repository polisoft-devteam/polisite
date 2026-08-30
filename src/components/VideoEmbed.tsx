// A film in the archive: a poster card that becomes the player once clicked.
//
// Nothing reaches Google until the play button is pressed — not even the thumbnail, which
// is why the poster is drawn here rather than fetched from i.ytimg.com. An ordinary embed
// contacts YouTube on page load for every visitor, including the ones who never watch.
//
// The player is youtube-nocookie.com, so even watching sets no third-party cookies.

"use client"

import { useState } from "react"

import { PlayIcon } from "@/lib/icons"

export function VideoEmbed({
  videoId,
  title,
  year,
  playLabel,
}: {
  videoId: string
  title: string
  year?: string
  playLabel: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  return (
    <figure className="border-border bg-card overflow-hidden rounded-xl border shadow-sm">
      {isPlaying ? (
        <div className="bg-muted aspect-video w-full">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            className="size-full border-0"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsPlaying(true)}
          aria-label={`${playLabel}: ${title}`}
          className="group focus-visible:ring-ring/50 relative block aspect-video w-full cursor-pointer overflow-hidden focus-visible:ring-3 focus-visible:outline-none"
        >
          <span className="from-primary/25 via-card to-accent/25 absolute inset-0 bg-linear-135" />
          {/* Two soft pools of colour, so the empty poster reads as designed. */}
          <span className="bg-primary/20 absolute -top-16 -left-10 size-56 rounded-full blur-3xl" />
          <span className="bg-accent/20 absolute -right-10 -bottom-16 size-56 rounded-full blur-3xl" />

          <span className="relative flex size-full items-center justify-center">
            <span className="bg-background/90 text-primary ring-primary/20 flex size-20 items-center justify-center rounded-full shadow-xl ring-1 transition-transform duration-300 group-hover:scale-110">
              <PlayIcon className="ml-1 size-9" />
            </span>
          </span>
        </button>
      )}

      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 py-3">
        <span className="font-heading text-base font-bold tracking-tight">
          {title}
        </span>
        {year && (
          <span className="text-muted-foreground text-sm tabular-nums">
            {year}
          </span>
        )}
      </figcaption>
    </figure>
  )
}
