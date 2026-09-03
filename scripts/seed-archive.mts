// Moves the archive that used to live in src/lib into the database, once.
//
// Idempotent on the URL, so running it twice does not double every album. Rows carry no
// added_by_member_id: nobody added these through the site, they were always just there.
//
//   pnpm seed:archive

import { eq } from "drizzle-orm"

import { db } from "../src/db/index"
import { archiveLinks } from "../src/db/schema"
import { detectArchiveLink } from "../src/features/archive/detect"
import { PHOTO_ALBUMS } from "../src/lib/association-albums"
import { ASSOCIATION_FILMS } from "../src/lib/association-media"
import { ASSOCIATION_PLAYLISTS } from "../src/lib/association-playlists"

type Row = typeof archiveLinks.$inferInsert

const rows: Row[] = [
  ...PHOTO_ALBUMS.map((album, index) => ({
    kind: "album" as const,
    label: album.label,
    url: album.url,
    externalId: null,
    albumGroup: album.group,
    coverUrl: album.coverUrl ?? null,
    caption: album.dateRange ?? null,
    sortOrder: index,
  })),

  ...ASSOCIATION_FILMS.map((film, index) => ({
    kind: "film" as const,
    label: film.title,
    url: `https://www.youtube.com/watch?v=${film.videoId}`,
    externalId: film.videoId,
    albumGroup: null,
    coverUrl: film.thumbnail,
    caption: film.year ?? null,
    sortOrder: index,
  })),

  ...ASSOCIATION_PLAYLISTS.map((playlist, index) => ({
    kind: "playlist" as const,
    label: playlist.label,
    url: `https://open.spotify.com/playlist/${playlist.playlistId}`,
    externalId: playlist.playlistId,
    albumGroup: null,
    coverUrl: null,
    caption: null,
    sortOrder: index,
  })),
]

let added = 0
let skipped = 0

for (const row of rows) {
  const existing = await db
    .select({ id: archiveLinks.id })
    .from(archiveLinks)
    .where(eq(archiveLinks.url, row.url))
    .limit(1)

  if (existing.length > 0) {
    skipped += 1
    continue
  }

  // The detector has to agree with the hand-written kind, or the add form and the seed
  // would file the same URL in two different places.
  const detected = detectArchiveLink(row.url)

  if (detected?.kind !== row.kind) {
    console.warn(
      `  ! ${row.label}: detector says ${detected?.kind ?? "nothing"}, seed says ${row.kind}`,
    )
  }

  await db.insert(archiveLinks).values(row)
  added += 1
}

console.log(`archive seeded: ${added} added, ${skipped} already there`)

process.exit(0)
