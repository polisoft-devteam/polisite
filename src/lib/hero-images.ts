// The photographs that cycle behind the front page: whatever sits in public/images/hero.
//
// Folder-driven rather than a hand-kept list, so adding one is dropping the file in and
// running `pnpm images:optimize`. Server only, and next.config.ts keeps the folder in the
// deployment's file trace so the read works there too.

import { readdir } from "node:fs/promises"
import path from "node:path"

const HERO_DIRECTORY = path.join(process.cwd(), "public", "images", "hero")

let cachedHeroImages: string[] | undefined

/**
 * Sorted by filename, so the cycle runs in the same order everywhere rather than in
 * whatever order the disk hands them back. In development the folder is re-read every
 * time, so a new photo appears without restarting the dev server.
 */
export async function readHeroImages() {
  if (!cachedHeroImages || process.env.NODE_ENV === "development") {
    const files = await readdir(HERO_DIRECTORY)

    cachedHeroImages = files
      .filter((file) => file.endsWith(".webp"))
      .sort()
      .map((file) => `/images/hero/${file}`)
  }

  return cachedHeroImages
}
