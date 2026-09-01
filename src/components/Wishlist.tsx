// A member's wishlist.
//
// Two audiences, one component, because the difference is only what the query returned:
// on your own list every claim field is null, because the query never asked. So there is
// no branch here that could leak a claim; there is simply nothing to render.

import { getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { ExternalLink } from "@/components/ExternalLink"
import { FormField } from "@/components/FormField"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  addWishAction,
  removeWishAction,
  toggleClaimAction,
} from "@/features/wishlist/actions"
import type { WishlistEntry } from "@/features/wishlist/queries"
import { ExternalLinkIcon, PlusIcon, RemoveIcon } from "@/lib/icons"

export async function Wishlist({
  entries,
  isOwnList,
}: {
  entries: WishlistEntry[]
  isOwnList: boolean
}) {
  const translateWishlist = await getTranslations("Wishlist")

  return (
    <PageSection heading={translateWishlist("title")}>
      {entries.length === 0 ? (
        <EmptyState>
          {translateWishlist(isOwnList ? "emptyOwn" : "emptyOther")}
        </EmptyState>
      ) : (
        <ItemList>
          {entries.map(({ item, claimCount, viewerHasClaimed }) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 p-3"
            >
              <ExternalLink href={item.url}>
                <ExternalLinkIcon className="size-3.5" />
                {item.title}
              </ExternalLink>

              {isOwnList ? (
                <form action={removeWishAction}>
                  <input type="hidden" name="itemId" value={item.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    aria-label={translateWishlist("remove")}
                  >
                    <RemoveIcon className="size-4" />
                  </Button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  {claimCount !== null && claimCount > 0 && (
                    <span className="text-muted-foreground text-xs">
                      {translateWishlist("claimedBy", { count: claimCount })}
                    </span>
                  )}

                  <form action={toggleClaimAction}>
                    <input type="hidden" name="itemId" value={item.id} />
                    <input
                      type="hidden"
                      name="claimed"
                      value={String(viewerHasClaimed)}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant={viewerHasClaimed ? "outline" : "default"}
                    >
                      {translateWishlist(
                        viewerHasClaimed
                          ? "release"
                          : claimCount && claimCount > 0
                            ? "join"
                            : "claim",
                      )}
                    </Button>
                  </form>
                </div>
              )}
            </li>
          ))}
        </ItemList>
      )}

      {isOwnList && (
        <>
          <p className="text-muted-foreground mt-4 text-xs">
            {translateWishlist("ownerBlindNote")}
          </p>

          <form
            action={addWishAction}
            className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <FormField label={translateWishlist("fieldTitle")} htmlFor="title">
              <Input id="title" name="title" required maxLength={140} />
            </FormField>

            <FormField label={translateWishlist("fieldUrl")} htmlFor="url">
              <Input
                id="url"
                name="url"
                type="url"
                placeholder="https://"
                required
              />
            </FormField>

            <Button type="submit">
              <PlusIcon className="size-4" />
              {translateWishlist("add")}
            </Button>
          </form>
        </>
      )}
    </PageSection>
  )
}
