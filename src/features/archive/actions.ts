"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { detectArchiveLink } from "@/features/archive/detect"
import {
  addArchiveLink,
  findArchiveLinkById,
  removeArchiveLink,
  updateArchiveLink,
} from "@/features/archive/queries"
import { getViewer } from "@/lib/auth"
import {
  canAddArchiveLink,
  canEditArchiveLink,
  canRemoveArchiveLink,
} from "@/lib/permissions"

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

const editSchema = addSchema.extend({
  archiveLinkId: z.string().uuid(),
})

export async function updateArchiveLinkAction(formData: FormData) {
  const viewer = await getViewer()

  const parsed = editSchema.safeParse({
    archiveLinkId: formData.get("archiveLinkId") ?? "",
    label: formData.get("label") ?? "",
    url: formData.get("url") ?? "",
    albumGroup: formData.get("albumGroup") || undefined,
  })

  if (!parsed.success) return

  const existing = await findArchiveLinkById(parsed.data.archiveLinkId)
  if (!existing || !canEditArchiveLink(viewer, existing)) return

  // Re-read from the URL rather than kept: an edit that swaps a YouTube link for an album
  // has changed what the thing is, and leaving the old kind would file it under videos.
  const detected = detectArchiveLink(parsed.data.url)
  if (!detected) return

  await updateArchiveLink(parsed.data.archiveLinkId, {
    kind: detected.kind,
    label: parsed.data.label,
    url: parsed.data.url.trim(),
    externalId: detected.externalId,
    albumGroup:
      detected.kind === "album" ? (parsed.data.albumGroup ?? "main") : null,
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
