// Turns archive rows into the shapes the cards already take.
//
// The cards predate the table and are fine as they are, so the row is adapted to them
// rather than four components being rewritten around a new type.

import type { ArchiveLink } from "@/db/schema"
import type { PhotoAlbum, AlbumGroup } from "@/lib/association-albums"
import type { AssociationFilm } from "@/lib/association-media"
import type { Playlist } from "@/lib/association-playlists"

export function toPhotoAlbum(link: ArchiveLink): PhotoAlbum {
  return {
    group: (link.albumGroup ?? "main") as AlbumGroup,
    label: link.label,
    url: link.url,
    coverUrl: link.coverUrl ?? undefined,
    dateRange: link.caption ?? undefined,
  }
}

export function toFilm(link: ArchiveLink): AssociationFilm {
  return {
    // Seeded rows carry ours from public/images/films; a member's paste has none, so the
    // card falls back to whatever it shows without one.
    videoId: link.externalId ?? "",
    title: link.label,
    year: link.caption ?? undefined,
    thumbnail: link.coverUrl ?? "",
  }
}

export function toPlaylist(link: ArchiveLink): Playlist {
  return { playlistId: link.externalId ?? "", label: link.label }
}
