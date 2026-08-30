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
}

export const ASSOCIATION_FILMS: AssociationFilm[] = [
  { videoId: "4YU7wdGniXE", title: "Poli tribute" },
  { videoId: "UHUWKOX_M7s", title: "Poog reel #1 ( Typiskt vårt clan )" },
  { videoId: "VvEEHjrxWzA", title: "Poog reel #2 ( Typiskt vår klan )" },
]
