// A row of album cards under a heading. Four across once there is room — album covers
// read fine small, and eighteen of them in three columns is a long scroll.

import { AlbumCard } from "@/components/AlbumCard"
import { LockedMediaCard } from "@/components/LockedMediaCard"
import { PageSection } from "@/components/PageSection"
import type { PhotoAlbum } from "@/lib/association-albums"

export function AlbumGrid({
  heading,
  albums,
  openLabel,
  canOpen,
}: {
  heading: string
  albums: PhotoAlbum[]
  openLabel: string
  /** When false, the share URLs are never passed to the browser. */
  canOpen: boolean
}) {
  if (albums.length === 0) return null

  return (
    <PageSection heading={heading}>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {albums.map((album) =>
          canOpen ? (
            <AlbumCard key={album.label} album={album} openLabel={openLabel} />
          ) : (
            <LockedMediaCard
              key={album.label}
              label={album.label}
              coverUrl={album.coverUrl}
              caption={album.dateRange}
            />
          ),
        )}
      </div>
    </PageSection>
  )
}
