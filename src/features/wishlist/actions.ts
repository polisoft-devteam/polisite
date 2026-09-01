"use server"

import { revalidatePath } from "next/cache"

import {
  addWishlistItem,
  claimWishlistItem,
  deleteWishlistItem,
  findWishlistItemById,
  releaseWishlistClaim,
} from "@/features/wishlist/queries"
import {
  readWishlistItemForm,
  wishlistClaimFormSchema,
  wishlistItemFormSchema,
} from "@/features/wishlist/schemas"
import { getViewer } from "@/lib/auth"
import { canClaimWish, canEditOwnWishlist } from "@/lib/permissions"

export async function addWishAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canEditOwnWishlist(viewer)) return

  const form = wishlistItemFormSchema.safeParse(readWishlistItemForm(formData))
  if (!form.success) return

  const memberId = viewer!.member!.id
  await addWishlistItem({ memberId, ...form.data })

  revalidatePath("/members/[memberId]", "page")
  revalidatePath("/profile")
}

export async function removeWishAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canEditOwnWishlist(viewer)) return

  const form = wishlistClaimFormSchema.safeParse({
    itemId: String(formData.get("itemId") ?? ""),
  })
  if (!form.success) return

  await deleteWishlistItem(form.data.itemId, viewer!.member!.id)

  revalidatePath("/members/[memberId]", "page")
  revalidatePath("/profile")
}

export async function toggleClaimAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canEditOwnWishlist(viewer)) return

  const form = wishlistClaimFormSchema.safeParse({
    itemId: String(formData.get("itemId") ?? ""),
  })
  if (!form.success) return

  const item = await findWishlistItemById(form.data.itemId)
  if (!item) return

  const memberId = viewer!.member!.id

  // Re-read the owner server-side: claiming your own wish would tell you it exists as a
  // claim, which is the one thing the owner must never learn.
  if (!canClaimWish(viewer, item.memberId)) return

  const isJoining = String(formData.get("claimed") ?? "") !== "true"

  if (isJoining) {
    await claimWishlistItem(item.id, memberId)
  } else {
    await releaseWishlistClaim(item.id, memberId)
  }

  revalidatePath("/members/[memberId]", "page")
}
