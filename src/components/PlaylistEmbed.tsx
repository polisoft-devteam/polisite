// A playlist from the archive, in the site's Spotify player.
//
// Holds the id rather than the link, so it builds the share URL back up and hands it to
// SpotifyEmbed. One iframe on the site, not two that drift apart.

import { SpotifyEmbed } from "@/components/SpotifyEmbed"
import type { Playlist } from "@/features/archive/view"

export function PlaylistEmbed({ playlist }: { playlist: Playlist }) {
  return (
    <SpotifyEmbed
      url={`https://open.spotify.com/playlist/${playlist.playlistId}`}
      title={playlist.label}
    />
  )
}
