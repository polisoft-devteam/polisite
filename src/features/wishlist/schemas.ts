// Zod at the server boundary for the wishlist forms.

import { z } from "zod"

export const wishlistItemFormSchema = z.object({
  title: z.string().trim().min(1).max(140),

  // Both halves are required: a wish is what you want and where to get it.
  url: z.string().trim().url().max(2000),
})

export const wishlistClaimFormSchema = z.object({
  itemId: z.string().uuid(),
})

export function readWishlistItemForm(formData: FormData) {
  return {
    title: String(formData.get("title") ?? ""),
    url: String(formData.get("url") ?? ""),
  }
}
