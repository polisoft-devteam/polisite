// Uploads images to Supabase Storage, resized and stripped of metadata.
//
// Server-only: it uses the secret key, which bypasses storage policies. Membership is
// checked by the calling server action before we get here.

import { randomUUID } from "node:crypto"

import { createClient } from "@supabase/supabase-js"
import sharp from "sharp"

export type ImageBucket = "avatars" | "event-images"

/**
 * Supabase Free gives 1 GB, so originals are never stored — an unresized phone photo is
 * 3–5 MB and ~250 of them would fill it. WebP at these sizes lands around 200–400 KB.
 */
const RESIZE_TARGET: Record<ImageBucket, { maxEdge: number; quality: number }> =
  {
    avatars: { maxEdge: 512, quality: 82 },
    "event-images": { maxEdge: 1600, quality: 80 },
  }

/** Rejected before decoding, so a huge file can't exhaust memory. */
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024

function createStorageClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
  )
}

/** Returns the public URL, or null if the field was empty. */
export async function uploadImage(
  bucket: ImageBucket,
  file: File | null,
): Promise<string | null> {
  if (!file || file.size === 0) return null

  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("Image is too large")
  }

  const { maxEdge, quality } = RESIZE_TARGET[bucket]

  const resized = await sharp(Buffer.from(await file.arrayBuffer()))
    // rotate() first: it bakes in the EXIF orientation, which the WebP encoder then
    // discards along with the rest of the metadata. Reversed, portrait photos come out
    // sideways. Dropping EXIF also drops the GPS coordinates phones embed.
    .rotate()
    .resize({
      width: maxEdge,
      height: maxEdge,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality })
    .toBuffer()

  // A uuid name means the URL of a members-only event's image can't be guessed.
  const path = `${randomUUID()}.webp`
  const storage = createStorageClient().storage.from(bucket)

  const { error } = await storage.upload(path, resized, {
    contentType: "image/webp",
    upsert: false,
  })

  if (error) throw new Error(`Upload failed: ${error.message}`)

  return storage.getPublicUrl(path).data.publicUrl
}

/**
 * Deletes an image we host, so replacing a photo doesn't leave the old one behind.
 * Ignores URLs from anywhere else — a Google avatar isn't ours to delete.
 */
export async function deleteImageIfOurs(
  bucket: ImageBucket,
  publicUrl: string | null,
): Promise<void> {
  if (!publicUrl) return

  const marker = `/storage/v1/object/public/${bucket}/`
  const markerIndex = publicUrl.indexOf(marker)
  if (markerIndex === -1) return

  const path = publicUrl.slice(markerIndex + marker.length)
  await createStorageClient().storage.from(bucket).remove([path])
}
