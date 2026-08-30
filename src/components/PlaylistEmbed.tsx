// A Spotify playlist, embedded.
//
// Rendered directly rather than behind a click: this is eight members visiting now and
// then, and a playlist is more use when you can see what is on it. The privacy page says
// so, which is the part that has to stay true.

import type { Playlist } from "@/lib/association-playlists"

export function PlaylistEmbed({ playlist }: { playlist: Playlist }) {
  return (
    <iframe
      src={`https://open.spotify.com/embed/playlist/${playlist.playlistId}?utm_source=generator`}
      title={playlist.label}
      height={352}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  )
}
