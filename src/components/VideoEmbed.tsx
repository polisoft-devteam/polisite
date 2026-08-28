// A YouTube video that loads only once someone asks for it.
//
// Nothing here talks to Google until the play button is pressed — not even the thumbnail,
// which is why the poster is ours rather than i.ytimg.com. The privacy page promises one
// necessary cookie and no tracking, and an ordinary embed would quietly make that untrue
// for every visitor who never watched the video.
//
// The player itself is youtube-nocookie.com, so even after pressing play there is no
// tracking cookie unless YouTube needs one to play.

"use client"

import { useState } from "react"

import { SiteImage } from "@/components/SiteImage"
import { PlayIcon } from "@/lib/icons"

export function VideoEmbed({
  videoId,
  title,
  posterSrc,
  playLabel,
  privacyNote,
}: {
  videoId: string
  title: string
  /** Ours, not YouTube's — fetching theirs would contact Google before any click. */
  posterSrc?: string
  playLabel: string
  privacyNote: string
}) {
  const [isPlaying, setIsPlaying] = useState(false)

  if (isPlaying) {
    return (
      <div className="bg-muted aspect-video w-full overflow-hidden rounded-lg">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="size-full border-0"
        />
      </div>
    )
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsPlaying(true)}
        aria-label={`${playLabel}: ${title}`}
        className="group focus-visible:ring-ring/50 relative block aspect-video w-full overflow-hidden rounded-lg focus-visible:ring-3 focus-visible:outline-none"
      >
        {posterSrc ? (
          <SiteImage
            src={posterSrc}
            alt=""
            rounded=""
            className="size-full transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 42rem, 100vw"
          />
        ) : (
          <span className="from-primary/20 to-accent/20 absolute inset-0 bg-linear-to-br" />
        )}

        <span className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25">
          <span className="bg-background/90 text-foreground flex size-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
            <PlayIcon className="ml-1 size-7" />
          </span>
          <span className="font-heading text-lg font-semibold text-white drop-shadow">
            {title}
          </span>
        </span>
      </button>

      <p className="text-muted-foreground mt-2 text-xs">{privacyNote}</p>
    </div>
  )
}
