// Reading wishlists.
//
// The rule that matters: a member must never learn anything about the claims on their own
// wishes. Not who claimed, and not that anything was claimed at all. So the claim rows are
// never fetched when the viewer owns the list, rather than fetched and hidden in the
// component. A surprise on your own birthday survives a careless render that way.

import { and, asc, eq, inArray } from "drizzle-orm"

import { db } from "@/db"
import { wishlistClaims, wishlistItems } from "@/db/schema"
import type { WishlistItem } from "@/db/schema"

export type WishlistEntry = {
  item: WishlistItem
  /**
   * How many people are in on it, and whether the viewer is one of them.
   *
   * Both are null for the owner of the list, which is not the same as zero: it means the
   * question was never asked.
   */
  claimCount: number | null
  viewerHasClaimed: boolean | null
}

export async function findWishlistForMember(
  memberId: string,
  viewerMemberId: string | null,
): Promise<WishlistEntry[]> {
  const items = await db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.memberId, memberId))
    .orderBy(asc(wishlistItems.createdAt))

  const viewerIsOwner = viewerMemberId === memberId

  // The owner's own list: stop here, so no claim ever reaches the page.
  if (viewerIsOwner || items.length === 0) {
    return items.map((item) => ({
      item,
      claimCount: null,
      viewerHasClaimed: null,
    }))
  }

  const claims = await db
    .select({
      itemId: wishlistClaims.itemId,
      memberId: wishlistClaims.memberId,
    })
    .from(wishlistClaims)
    .where(
      inArray(
        wishlistClaims.itemId,
        items.map((item) => item.id),
      ),
    )

  return items.map((item) => {
    const itemClaims = claims.filter((claim) => claim.itemId === item.id)

    return {
      item,
      claimCount: itemClaims.length,
      viewerHasClaimed: itemClaims.some(
        (claim) => claim.memberId === viewerMemberId,
      ),
    }
  })
}

export async function addWishlistItem(item: {
  memberId: string
  title: string
  url: string
}): Promise<void> {
  await db.insert(wishlistItems).values(item)
}

export async function deleteWishlistItem(
  itemId: string,
  memberId: string,
): Promise<void> {
  // Scoped to the owner, so an id from someone else's list deletes nothing.
  await db
    .delete(wishlistItems)
    .where(
      and(eq(wishlistItems.id, itemId), eq(wishlistItems.memberId, memberId)),
    )
}

export async function findWishlistItemById(
  itemId: string,
): Promise<WishlistItem | null> {
  const [item] = await db
    .select()
    .from(wishlistItems)
    .where(eq(wishlistItems.id, itemId))
    .limit(1)

  return item ?? null
}

export async function claimWishlistItem(
  itemId: string,
  memberId: string,
): Promise<void> {
  // Joining a claim someone already made is the same row, so this is idempotent.
  await db
    .insert(wishlistClaims)
    .values({ itemId, memberId })
    .onConflictDoNothing()
}

export async function releaseWishlistClaim(
  itemId: string,
  memberId: string,
): Promise<void> {
  await db
    .delete(wishlistClaims)
    .where(
      and(
        eq(wishlistClaims.itemId, itemId),
        eq(wishlistClaims.memberId, memberId),
      ),
    )
}
