// A row of album cards under a heading. Four across once there is room — album covers
// read fine small, and eighteen of them in three columns is a long scroll.

import { AlbumCard } from "@/components/AlbumCard"
import { PageSection } from "@/components/PageSection"
import type { PhotoAlbum } from "@/lib/association-albums"

export function AlbumGrid({
  heading,
  albums,
  openLabel,
}: {
  heading: string
  albums: PhotoAlbum[]
  openLabel: string
}) {
  if (albums.length === 0) return null

  return (
    <PageSection heading={heading}>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {albums.map((album) => (
          <AlbumCard key={album.url} album={album} openLabel={openLabel} />
        ))}
      </div>
    </PageSection>
  )
}
