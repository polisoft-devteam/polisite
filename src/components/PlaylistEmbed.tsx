// A Spotify playlist that loads only once someone asks for it.
//
// A Spotify iframe contacts them as soon as it renders, so the card starts as ours and
// becomes their player on click — the same bargain as the film embeds.

"use client"

import { useState } from "react"

import { MusicIcon, SpotifyIcon } from "@/lib/icons"

export function PlaylistEmbed({
  playlistId,
  label,
  openLabel,
}: {
  playlistId: string
  label: string
  openLabel: string
}) {
  const [isLoaded, setIsLoaded] = useState(false)

  if (isLoaded) {
    return (
      <iframe
        src={`https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator`}
        title={label}
        height={352}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        className="w-full rounded-xl border-0"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setIsLoaded(true)}
      aria-label={`${openLabel}: ${label}`}
      className="group border-border bg-card focus-visible:ring-ring/50 relative flex h-[352px] w-full cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-lg focus-visible:ring-3 focus-visible:outline-none"
    >
      <span className="from-primary/20 via-card to-accent/20 absolute inset-0 bg-linear-135" />

      <span className="bg-background/90 text-primary relative flex size-16 items-center justify-center rounded-full shadow-lg transition-transform duration-300 group-hover:scale-110">
        <MusicIcon className="size-7" />
      </span>

      <span className="font-heading relative text-base font-bold tracking-tight">
        {label}
      </span>

      <span className="text-muted-foreground relative flex items-center gap-1.5 text-xs font-medium">
        <SpotifyIcon className="size-4" />
        {openLabel}
      </span>
    </button>
  )
}
