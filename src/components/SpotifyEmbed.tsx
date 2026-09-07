// A Spotify player, embedded.
//
// Rendered directly rather than behind a click: this is a handful of members visiting now
// and then, and a playlist is more use when you can see what is on it. The privacy page
// says so, which is the part that has to stay true.
//
// The one iframe on the site that talks to Spotify. A link it cannot show renders nothing
// rather than an empty box.

import { spotifyEmbed } from "@/lib/spotify"

export function SpotifyEmbed({
  url,
  title,
}: {
  url: string | null
  /** What the player is, for anyone who reaches it by keyboard or screen reader. */
  title: string
}) {
  const embed = spotifyEmbed(url)

  if (!embed) return null

  return (
    <iframe
      src={embed.url}
      title={title}
      height={embed.isCompact ? 152 : 352}
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      className="w-full rounded-xl border-0"
    />
  )
}
