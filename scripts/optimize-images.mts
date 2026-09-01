/**
 * Resizes everything under public/images to WebP, in place, subfolders included.
 *
 *   pnpm images:optimize
 *
 * Photos straight off a phone are 3-5 MB and would sit in git history forever. Safe to
 * re-run: files already converted are skipped.
 */

import { readdir, stat, unlink, writeFile } from "node:fs/promises"
import path from "node:path"

import sharp from "sharp"

const IMAGES_DIR = "public/images"
const MAX_EDGE = 2000
const QUALITY = 82

const SOURCE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".tif", ".tiff", ".heic"]

// Recursive: the photos are grouped into folders now (hero, films), and a flat read
// silently converted nothing while reporting success.
const entries = await readdir(IMAGES_DIR, { recursive: true })
let converted = 0

for (const entry of entries) {
  const extension = path.extname(entry).toLowerCase()
  if (!SOURCE_EXTENSIONS.includes(extension)) continue

  const sourcePath = path.join(IMAGES_DIR, entry)
  const targetPath = path.join(
    IMAGES_DIR,
    path.dirname(entry),
    `${path.basename(entry, extension)}.webp`,
  )

  const before = (await stat(sourcePath)).size

  // rotate() first so the EXIF orientation is applied before metadata is dropped.
  const output = await sharp(sourcePath)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: QUALITY })
    .toBuffer()

  await writeFile(targetPath, output)
  await unlink(sourcePath)

  const saved = Math.round((1 - output.length / before) * 100)
  console.log(
    `${entry} → ${path.relative(IMAGES_DIR, targetPath)}  ${Math.round(before / 1024)} KB → ${Math.round(output.length / 1024)} KB  (-${saved}%)`,
  )
  converted += 1
}

console.log(
  converted === 0 ? "Nothing to convert." : `Converted ${converted} image(s).`,
)
