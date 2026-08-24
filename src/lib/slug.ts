// Readable URLs. "Bastufestival på Ön" plus a date becomes
// "bastufestival-pa-on-2026-10-04".

import { formatInTimeZone } from "date-fns-tz"

const MAX_SLUG_LENGTH = 60

/**
 * Folds accents rather than dropping them, so "Ön" becomes "on" instead of "n".
 * Swedish å/ä/ö become a/a/o, which is the usual convention for Swedish URLs.
 */
export function toSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/, "")
}

/**
 * The date is in the event's own timezone, so the URL matches the date shown on the page.
 * A suggestion with no date yet gets just the title.
 */
export function buildEventSlug(
  title: string,
  startsAt: Date | null,
  timeZone: string,
): string {
  const titleSlug = toSlug(title) || "event"

  if (!startsAt) return titleSlug

  return `${titleSlug}-${formatInTimeZone(startsAt, timeZone, "yyyy-MM-dd")}`
}

/**
 * Appends -2, -3 … until the slug is free.
 *
 * `isTaken` is passed in rather than queried here, so this file needs no database access
 * and stays testable.
 */
export async function toUniqueSlug(
  candidate: string,
  isTaken: (slug: string) => Promise<boolean>,
): Promise<string> {
  if (!(await isTaken(candidate))) return candidate

  for (let suffix = 2; suffix < 100; suffix += 1) {
    const withSuffix = `${candidate}-${suffix}`
    if (!(await isTaken(withSuffix))) return withSuffix
  }

  throw new Error(`Could not find a free slug for "${candidate}"`)
}
