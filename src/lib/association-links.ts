// Places the association keeps things that don't live in this app.
//
// The URLs come from the environment, not from this file. A Google Photos album or Drive
// folder shared "anyone with the link" is a key, not an address — committing one puts it
// in git history forever and hands it to everyone who can read the repo. Keeping them in
// env vars also means a leaked link is rotated by re-sharing and updating one value.
//
// Not NEXT_PUBLIC: they are read on the server and only rendered for active members, so
// they never reach a guest's browser at all.

import { z } from "zod"

export type AssociationLink = {
  id: "discord" | "drive" | "github"
  url: string
}

export type PhotoAlbum = {
  label: string
  url: string
}

/** Only the ones actually configured, so an unset variable shows nothing rather than a dead link. */
export function getAssociationLinks(): AssociationLink[] {
  const configured: [AssociationLink["id"], string | undefined][] = [
    ["discord", process.env.DISCORD_INVITE_URL],
    ["drive", process.env.GOOGLE_DRIVE_URL],
    ["github", process.env.GITHUB_REPO_URL],
  ]

  return configured
    .filter((entry): entry is [AssociationLink["id"], string] =>
      Boolean(entry[1]?.trim()),
    )
    .map(([id, url]) => ({ id, url: url.trim() }))
}

const photoAlbumsSchema = z.array(
  z.object({
    label: z.string().trim().min(1),
    url: z.string().trim().url(),
  }),
)

/**
 * The shared albums, as a JSON array in GOOGLE_PHOTOS_ALBUMS.
 *
 * One variable rather than one per album: there are already seventeen of them, and a
 * numbered set of variables is how two of them end up pointing at the same place.
 * A malformed value yields no albums rather than a crash — the page still renders.
 */
export function getPhotoAlbums(): PhotoAlbum[] {
  const raw = process.env.GOOGLE_PHOTOS_ALBUMS?.trim()
  if (!raw) return []

  try {
    const parsed = photoAlbumsSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : []
  } catch {
    return []
  }
}
