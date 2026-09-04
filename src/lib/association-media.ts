// Seed data, and nothing else. Read once by scripts/seed-archive.mts and by nothing the
// app renders: the films live in the archive_links table now.
//
// Safe to delete along with the seed script once the table is the only copy anybody
// needs. It is kept for the moment so a fresh database can be filled without hand
// typing twenty three rows, but it is a snapshot of September 2026 and does not know
// about anything added through the site since.
//
export type AssociationFilm = {
  /** The v= part of the YouTube URL. */
  videoId: string
  title: string
  year?: string
  /**
   * Ours, in public/images/films. Not named after the video id: an unlisted film is
   * only as private as its id, and an image path is readable by anyone.
   */
  thumbnail: string
}

export const ASSOCIATION_FILMS: AssociationFilm[] = [
  {
    videoId: "4YU7wdGniXE",
    title: "Poli tribute",
    thumbnail: "/images/films/poli-tribute.webp",
  },
  {
    videoId: "UHUWKOX_M7s",
    title: "Poog reel #1 ( Typiskt vårt clan )",
    thumbnail: "/images/films/poog-reel-1.webp",
  },
  {
    videoId: "VvEEHjrxWzA",
    title: "Poog reel #2 ( Typiskt vår klan )",
    thumbnail: "/images/films/poog-reel-2.webp",
  },
]
