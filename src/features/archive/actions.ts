"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { detectArchiveLink } from "@/features/archive/detect"
import {
  addArchiveLink,
  findArchiveLinkById,
  removeArchiveLink,
} from "@/features/archive/queries"
import { getViewer } from "@/lib/auth"
import { canAddArchiveLink, canRemoveArchiveLink } from "@/lib/permissions"

const addSchema = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().trim().min(1).max(2000),
  // Only meaningful for an album; ignored for everything else.
  albumGroup: z.enum(["main", "gaming"]).optional(),
})

export async function addArchiveLinkAction(formData: FormData) {
  const viewer = await getViewer()
  if (!canAddArchiveLink(viewer)) return

  const parsed = addSchema.safeParse({
    label: formData.get("label") ?? "",
    url: formData.get("url") ?? "",
    albumGroup: formData.get("albumGroup") || undefined,
  })

  if (!parsed.success) return

  // The URL decides what this is. Null means it is not a web address at all, which is the
  // one thing the archive cannot show.
  const detected = detectArchiveLink(parsed.data.url)
  if (!detected) return

  await addArchiveLink({
    kind: detected.kind,
    label: parsed.data.label,
    url: parsed.data.url.trim(),
    externalId: detected.externalId,
    albumGroup:
      detected.kind === "album" ? (parsed.data.albumGroup ?? "main") : null,
    addedByMemberId: viewer!.member!.id,
  })

  revalidatePath("/archive")
}

export async function removeArchiveLinkAction(formData: FormData) {
  const viewer = await getViewer()
  const id = String(formData.get("archiveLinkId") ?? "")

  const link = await findArchiveLinkById(id)
  if (!link || !canRemoveArchiveLink(viewer, link)) return

  await removeArchiveLink(id)
  revalidatePath("/archive")
}
