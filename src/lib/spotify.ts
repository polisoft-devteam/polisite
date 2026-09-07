// Turning a Spotify link into something that can be embedded.
//
// Spotify's own player is one URL away from any share link: open.spotify.com/<kind>/<id>
// becomes open.spotify.com/embed/<kind>/<id>. What differs is the height, because a track
// is a strip and a playlist is a list.
//
// Anything that is not a Spotify link comes back null and shows nothing. The share sheet
// hands out localised links (/intl-sv/track/...), so the prefix is skipped rather than
// treated as the kind.

/** What Spotify will render in an iframe. A show or an artist page will not. */
const EMBEDDABLE_KINDS = [
  "playlist",
  "album",
  "track",
  "episode",
  "show",
  "artist",
] as const

/** A single track or episode is one row; the rest need room for a list. */
const COMPACT_KINDS = ["track", "episode"]

export type SpotifyEmbed = {
  url: string
  isCompact: boolean
}

export function spotifyEmbed(rawUrl: string | null): SpotifyEmbed | null {
  if (!rawUrl) return null

  let url: URL

  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }

  if (url.hostname.replace(/^www\./, "") !== "open.spotify.com") return null

  const segments = url.pathname.split("/").filter(Boolean)
  // Drops the /intl-sv the share sheet adds, and nothing else: every other first segment
  // is the kind itself.
  const [kind, id] = segments[0]?.startsWith("intl-")
    ? segments.slice(1)
    : segments

  if (!kind || !id) return null
  if (!(EMBEDDABLE_KINDS as readonly string[]).includes(kind)) return null

  return {
    url: `https://open.spotify.com/embed/${kind}/${id}?utm_source=generator`,
    isCompact: COMPACT_KINDS.includes(kind),
  }
}

/** True for anything the player can show, which is what the event form will accept. */
export function isEmbeddableSpotifyUrl(rawUrl: string): boolean {
  return spotifyEmbed(rawUrl) !== null
}
