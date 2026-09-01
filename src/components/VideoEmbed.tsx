// A film in the archive: a thumbnail card that becomes the player once clicked.
//
// Nothing reaches Google until the play button is pressed — the thumbnail is ours, in
// public/images/films, because loading YouTube's would contact them on page load for
// every visitor including the ones who never watch. This section is public, so that
// matters more here than on the members-only album grid.
//
// The player is youtube-nocookie.com, so even watching sets no third-party cookies.

"use client"

import { useState } from "react"

import { SiteImage } from "@/components/SiteImage"
import { PlayIcon } from "@/lib/icons"

export function VideoEmbed({
  videoId,
  title,
  year,
  thumbnail,
  playLabel,
}: {
  videoId: string
  title: string
  year?: string
  thumbnail: string
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
          <SiteImage
            src={thumbnail}
            alt=""
            rounded=""
            className="size-full transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 30vw, 100vw"
          />

          <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/45 text-white transition-colors duration-300 group-hover:bg-black/60">
            <span className="bg-background/90 text-primary-ink flex size-12 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
              <PlayIcon className="ml-0.5 size-6" />
            </span>
            <span className="px-3 text-center text-xs font-medium opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              {playLabel}
            </span>
          </span>
        </button>
      )}

      <figcaption className="block px-3 py-2.5">
        <span className="font-heading block truncate text-sm font-bold tracking-tight">
          {title}
        </span>
        {year && (
          <span className="text-muted-foreground block text-xs">{year}</span>
        )}
      </figcaption>
    </figure>
  )
}
