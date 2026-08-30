// One shared photo album: its cover, its name, and when the photos are from.
//
// The cover is served by Google, so unlike the film posters this does reach out on page
// load. That is already true of member avatars from the same host, and this section is
// members-only — but it is the reason the film embeds are click-to-load and this is not.

import { ExternalLink } from "@/components/ExternalLink"
import { SiteImage } from "@/components/SiteImage"
import type { PhotoAlbum } from "@/lib/association-albums"

export function AlbumCard({ album }: { album: PhotoAlbum }) {
  return (
    <ExternalLink
      href={album.url}
      variant="plain"
      className="group border-border bg-card block overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-lg"
    >
      <SiteImage
        src={album.coverUrl}
        alt=""
        rounded=""
        className="aspect-16/9 w-full transition-transform duration-500 group-hover:scale-105"
        sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
      />

      <span className="block px-4 py-3">
        <span className="font-heading block truncate text-base font-bold tracking-tight">
          {album.label}
        </span>
        {album.dateRange && (
          <span className="text-muted-foreground block text-sm">
            {album.dateRange}
          </span>
        )}
      </span>
    </ExternalLink>
  )
}
