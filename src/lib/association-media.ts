// Kept as the seed's source, not the page's: the films live in archive_links now and are
// read from there. See scripts/seed-archive.mts.
//
// Films and other things the association has made.
//
// Hosted on YouTube rather than in Supabase Storage: the free tier is 1 GB in total, and
// a video in the repo would be cloned and deployed forever. Unlisted, so they are reachable
// by link and embed but not by search.
//
// Titles are as published — user-written content, so never translated.

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
