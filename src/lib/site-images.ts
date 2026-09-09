// The curated photographs under public/images, read from disk rather than listed in code.
//
// Folder-driven so adding one is dropping the file in and running `pnpm images:optimize`.
// Server only, and next.config.ts keeps the images folder in the deployment's file trace,
// because files under public are otherwise left out of the server bundle.

import { readdir } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

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

/** The one photograph behind the archive's heading. */
export function readArchiveImages(): Promise<string[]> {
  return readImagesIn("archive")
}

/** The pile of photographs beside the About page's history. */
export function readAboutImages(): Promise<string[]> {
  return readImagesIn("about")
}

export type FooterLogo = {
  src: string
  width: number
  height: number
}

/** Cached alongside the folder listing; a logo's proportions do not change. */
let cachedFooterLogos: FooterLogo[] | null = null

/**
 * The logos in the footer, in filename order, each with its own proportions.
 *
 * The sizes are read from the files rather than written down, because the row hangs them
 * all at one height and lets the widths follow. A square logo and a wide one in the same
 * fixed box leaves one of them looking half the size of the other.
 */
export async function readFooterLogos(): Promise<FooterLogo[]> {
  if (cachedFooterLogos && process.env.NODE_ENV !== "development") {
    return cachedFooterLogos
  }

  const images = await readImagesIn("footer")

  cachedFooterLogos = await Promise.all(
    images.map(async (src) => {
      const { width, height } = await sharp(
        path.join(process.cwd(), "public", src),
      ).metadata()

      return { src, width: width ?? 1, height: height ?? 1 }
    }),
  )

  return cachedFooterLogos
}

/** The photograph behind the Val 2026 heading. Empty until somebody drops one in. */
export function readElectionImages(): Promise<string[]> {
  return readImagesIn("election")
}

/**
 * Party logos, keyed by the party they belong to: parties/l.webp is Liberalerna's, using
 * the same key as lib/election.ts. Nothing to register, and a party with no file simply
 * shows its abbreviation, which is what all fourteen do today.
 */
export async function readPartyImages(): Promise<Map<string, string>> {
  const images = await readImagesIn("parties")

  return new Map(images.map((image) => [path.basename(image, ".webp"), image]))
}

/**
 * Badge artwork, keyed by the badge it belongs to: badges/traveller.webp is the Traveller
 * badge's picture. The filename is the whole connection — nothing to register, no id to
 * keep in step, and a badge with no file simply falls back to its icon.
 */
export async function readBadgeImages(): Promise<Map<string, string>> {
  const images = await readImagesIn("badges")

  return new Map(images.map((image) => [path.basename(image, ".webp"), image]))
}
