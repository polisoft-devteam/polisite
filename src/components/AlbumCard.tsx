// One shared photo album: its cover, its name, and when the photos are from.
//
// Clicking leaves the site for Google Photos, so hovering says so — an icon and a line of
// text over a dimmed cover, rather than making people guess from a bare image.
//
// The cover is served by Google, so unlike the film posters this does reach out on page
// load. Same host as member avatars, and this section is members-only, but it is a
// deliberate difference rather than an oversight.

import { ExternalLink } from "@/components/ExternalLink"
import { SiteImage } from "@/components/SiteImage"
import type { PhotoAlbum } from "@/lib/association-albums"
import { ExternalLinkIcon } from "@/lib/icons"

export function AlbumCard({
  album,
  openLabel,
}: {
  album: PhotoAlbum
  openLabel: string
}) {
  return (
    <ExternalLink
      href={album.url}
      variant="plain"
      className="group border-border bg-card block overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
    >
      <span className="relative block overflow-hidden">
        {album.coverUrl ? (
          <SiteImage
            src={album.coverUrl}
            alt=""
            rounded=""
            className="aspect-16/9 w-full transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 16rem, (min-width: 640px) 30vw, 100vw"
          />
        ) : (
          // No public link yet, so Google gives us no cover to show.
          <span className="from-primary/25 via-card to-accent/25 block aspect-16/9 w-full bg-linear-135" />
        )}

        <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/55 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <ExternalLinkIcon className="size-6" />
          <span className="px-3 text-center text-xs font-medium">
            {openLabel}
          </span>
        </span>
      </span>

      <span className="block px-3 py-2.5">
        <span className="font-heading block truncate text-sm font-bold tracking-tight">
          {album.label}
        </span>
        {album.dateRange && (
          <span className="text-muted-foreground block truncate text-xs">
            {album.dateRange}
          </span>
        )}
      </span>
    </ExternalLink>
  )
}
