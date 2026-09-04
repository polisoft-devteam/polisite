// Seed data, and nothing else. Read once by scripts/seed-archive.mts and by nothing the
// app renders: the playlists live in the archive_links table now.
//
// Safe to delete along with the seed script once the table is the only copy anybody
// needs. It is kept for the moment so a fresh database can be filled without hand
// typing twenty three rows, but it is a snapshot of September 2026 and does not know
// about anything added through the site since.
//
export type Playlist = {
  /** The id from open.spotify.com/playlist/<id>. */
  playlistId: string
  label: string
}

export const ASSOCIATION_PLAYLISTS: Playlist[] = [
  { playlistId: "0LxXS2Sx7F9oeesyRI15N5", label: "PoliSound" },
  { playlistId: "1B95qmpqc7g1wgdcFcBUwP", label: "Drum & Bass" },
]
