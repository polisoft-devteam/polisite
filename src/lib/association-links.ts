// Places the association keeps things that don't live in this app.
//
// The URLs come from the environment, not from this file. A Google Photos album or Drive
// folder shared "anyone with the link" is a key, not an address — committing one puts it
// in git history forever and hands it to everyone who can read the repo. Keeping them in
// env vars also means a leaked link is rotated by re-sharing and updating one value.
//
// Not NEXT_PUBLIC: they are read on the server and only rendered for active members, so
// they never reach a guest's browser at all.

export type AssociationLink = {
  id: "discord" | "photos" | "drive" | "github"
  url: string
}

/** Only the ones actually configured, so an unset variable shows nothing rather than a dead link. */
export function getAssociationLinks(): AssociationLink[] {
  const configured: [AssociationLink["id"], string | undefined][] = [
    ["discord", process.env.DISCORD_INVITE_URL],
    ["photos", process.env.GOOGLE_PHOTOS_URL],
    ["drive", process.env.GOOGLE_DRIVE_URL],
    ["github", process.env.GITHUB_REPO_URL],
  ]

  return configured
    .filter((entry): entry is [AssociationLink["id"], string] =>
      Boolean(entry[1]?.trim()),
    )
    .map(([id, url]) => ({ id, url: url.trim() }))
}
