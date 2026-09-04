// Database access for the open archive. Per CLAUDE.md this is one of the only places
// allowed to import src/db.

import { and, asc, desc, eq } from "drizzle-orm"

import { db } from "@/db"
import {
  archiveLinks,
  type ArchiveLink,
  type ArchiveLinkKind,
} from "@/db/schema"

/**
 * Everything in the archive, in one query, grouped by kind for the page to lay out.
 *
 * One round trip rather than four: the page shows every section at once, so fetching per
 * section would be four queries to build one screen.
 */
export async function findArchiveLinks(): Promise<
  Record<ArchiveLinkKind, ArchiveLink[]>
> {
  const rows = await db
    .select()
    .from(archiveLinks)
    .orderBy(asc(archiveLinks.sortOrder), desc(archiveLinks.createdAt))

  const byKind: Record<ArchiveLinkKind, ArchiveLink[]> = {
    album: [],
    film: [],
    playlist: [],
    soundcloud: [],
    resource: [],
  }

  for (const row of rows) byKind[row.kind].push(row)

  return byKind
}

export async function addArchiveLink(link: {
  kind: ArchiveLinkKind
  label: string
  url: string
  externalId: string | null
  albumGroup: string | null
  addedByMemberId: string
}): Promise<void> {
  await db.insert(archiveLinks).values(link)
}

export async function updateArchiveLink(
  id: string,
  fields: {
    kind: ArchiveLinkKind
    label: string
    url: string
    externalId: string | null
    albumGroup: string | null
  },
): Promise<void> {
  await db.update(archiveLinks).set(fields).where(eq(archiveLinks.id, id))
}

export async function findArchiveLinkById(
  id: string,
): Promise<ArchiveLink | null> {
  const [link] = await db
    .select()
    .from(archiveLinks)
    .where(eq(archiveLinks.id, id))
    .limit(1)

  return link ?? null
}

export async function removeArchiveLink(id: string): Promise<void> {
  await db.delete(archiveLinks).where(eq(archiveLinks.id, id))
}

/** Used by the seed script, so re-running it does not double every album. */
export async function findArchiveLinkByUrl(
  url: string,
): Promise<ArchiveLink | null> {
  const [link] = await db
    .select()
    .from(archiveLinks)
    .where(and(eq(archiveLinks.url, url)))
    .limit(1)

  return link ?? null
}
