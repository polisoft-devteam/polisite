// The curated photographs under public/images, read from disk rather than listed in code.
//
// Folder-driven so adding one is dropping the file in and running `pnpm images:optimize`.
// Server only, and next.config.ts keeps the images folder in the deployment's file trace,
// because files under public are otherwise left out of the server bundle.

import { readdir } from "node:fs/promises"
import path from "node:path"

const IMAGES_DIRECTORY = path.join(process.cwd(), "public", "images")

/** Cached per folder in production; see readImagesIn. */
const cachedImages = new Map<string, string[]>()

/**
 * Every .webp in public/images/<folder>, sorted by filename so the order is the same
 * everywhere rather than whatever order the disk hands them back.
 *
 * In development the folder is re-read every time, so a new photo appears without
 * restarting the dev server.
 */
export async function readImagesIn(folder: string): Promise<string[]> {
  const cached = cachedImages.get(folder)

  if (cached && process.env.NODE_ENV !== "development") return cached

  const files = await readdir(path.join(IMAGES_DIRECTORY, folder))

  const images = files
    .filter((file) => file.endsWith(".webp"))
    .sort()
    .map((file) => `/images/${folder}/${file}`)

  cachedImages.set(folder, images)

  return images
}

/** The photographs that cycle behind the front page. */
export function readHeroImages(): Promise<string[]> {
  return readImagesIn("hero")
}

/** The pile of photographs beside the About page's history. */
export function readAboutImages(): Promise<string[]> {
  return readImagesIn("about")
}
