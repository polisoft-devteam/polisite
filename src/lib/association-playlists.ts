// Kept as the seed's source, not the page's: the playlists live in archive_links now and
// are read from there. See scripts/seed-archive.mts.
//
// Spotify playlists the association keeps.
//
// Only the playlist id is stored. The embed is loaded on click rather than with the page,
// the same as the films — a Spotify iframe reaches out to them the moment it renders.
//
// No cover art of our own: a playlist cover is a mosaic of album artwork we don't own, so
// the artwork is shown by Spotify's own embed, which is the sanctioned way to display it.

export type Playlist = {
  /** The id from open.spotify.com/playlist/<id>. */
  playlistId: string
  label: string
}

export const ASSOCIATION_PLAYLISTS: Playlist[] = [
  { playlistId: "0LxXS2Sx7F9oeesyRI15N5", label: "PoliSound" },
  { playlistId: "1B95qmpqc7g1wgdcFcBUwP", label: "Drum & Bass" },
]
