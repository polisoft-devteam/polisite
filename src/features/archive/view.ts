// The shapes the archive's cards take, and how a row becomes one.
//
// The cards predate the table and are fine as they are, so a row is adapted to them rather
// than four components being rewritten around a new type.
//
// The types live here rather than beside the seed data they were written for. Nothing the
// app renders should reach into a file that exists only to be imported once by a script.

import type { ArchiveLink } from "@/db/schema"

/** Albums split into the main run and the gaming ones. */
export type AlbumGroup = "main" | "gaming"

export type PhotoAlbum = {
  group: AlbumGroup
  label: string
  /** The full share URL, including ?key= where the album has one. */
  url: string
  /** Google's own cover. The size suffix is ours; it serves any crop. */
  coverUrl?: string
  /** As Google reports it, so it stays in English. */
  dateRange?: string
}

export type AssociationFilm = {
  /** The v= part of the YouTube URL. */
  videoId: string
  title: string
  year?: string
  thumbnail: string
}

export type Playlist = {
  /** The id from open.spotify.com/playlist/<id>. */
  playlistId: string
  label: string
}

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
