// What kind of thing a pasted URL is, and the one piece of it worth keeping.
//
// The whole point of the add form: a member pastes a link and the archive works out for
// itself whether that is an album, a film, a playlist or just a link. Asking them to pick
// from a dropdown would be asking them to repeat what the URL already says.
//
// No network. This reads the URL and nothing else, so it is a plain function of its input
// and is tested as one.

export type ArchiveLinkKind =
  "album" | "film" | "playlist" | "soundcloud" | "resource"

export type DetectedLink = {
  kind: ArchiveLinkKind
  /**
   * The video or playlist id, for the kinds that embed. Null for an album or a plain
   * link, which are opened rather than embedded.
   */
  externalId: string | null
}

/** Hosts, without the www, so one list covers both spellings. */
function hostOf(url: URL): string {
  return url.hostname.replace(/^www\./, "").toLowerCase()
}

const GOOGLE_PHOTOS_HOSTS = ["photos.google.com", "photos.app.goo.gl"]

function youTubeVideoId(url: URL, host: string): string | null {
  // youtu.be/<id>
  if (host === "youtu.be") return url.pathname.slice(1) || null

  if (host !== "youtube.com" && host !== "m.youtube.com") return null

  // The watch page, and the two forms that carry the id in the path instead.
  const fromQuery = url.searchParams.get("v")
  if (fromQuery) return fromQuery

  const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)
  return match ? match[1] : null
}

/**
 * SoundCloud is addressed by its own page URL rather than by an id: the widget takes a
 * permalink, so a member pastes the link from the address bar and nothing has to be dug
 * out of it. A player URL that has already been built carries the real one inside it.
 */
function soundCloudUrl(url: URL, host: string): string | null {
  if (host === "w.soundcloud.com") return url.searchParams.get("url")

  const isSoundCloud =
    host === "soundcloud.com" ||
    host === "m.soundcloud.com" ||
    host === "on.soundcloud.com"

  // The front page is not a track. Anything with a path is a user, a set or a track, all
  // three of which the widget knows how to show.
  return isSoundCloud && url.pathname.length > 1 ? url.toString() : null
}

function spotifyPlaylistId(url: URL, host: string): string | null {
  if (host !== "open.spotify.com") return null

  // /playlist/<id> and the localised /intl-sv/playlist/<id>.
  const match = url.pathname.match(/\/playlist\/([^/]+)/)
  return match ? match[1] : null
}

/**
 * Anything unrecognised is a resource rather than an error. A link nobody thought of is
 * still worth keeping, and refusing it would send a member back to Discord to post it.
 */
export function detectArchiveLink(rawUrl: string): DetectedLink | null {
  let url: URL

  try {
    url = new URL(rawUrl.trim())
  } catch {
    return null
  }

  // A link that is not fetched over the web is not a link we can show.
  if (url.protocol !== "https:" && url.protocol !== "http:") return null

  const host = hostOf(url)

  if (GOOGLE_PHOTOS_HOSTS.includes(host)) {
    return { kind: "album", externalId: null }
  }

  const videoId = youTubeVideoId(url, host)
  if (videoId) return { kind: "film", externalId: videoId }

  const playlistId = spotifyPlaylistId(url, host)
  if (playlistId) return { kind: "playlist", externalId: playlistId }

  const soundCloud = soundCloudUrl(url, host)
  if (soundCloud) return { kind: "soundcloud", externalId: soundCloud }

  return { kind: "resource", externalId: null }
}
