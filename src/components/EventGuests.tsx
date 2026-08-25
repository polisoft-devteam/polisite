// Friends and family a member is bringing along. A name box to add one, and a list with
// a remove button next to the ones you may take off again.
//
// Plain forms posting to server actions, so no client JavaScript.

import { getTranslations } from "next-intl/server"

import { GuestAvatar } from "@/components/MemberAvatar"
import { EmptyState } from "@/components/EmptyState"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addGuestAction, removeGuestAction } from "@/features/events/actions"
import type { EventGuestWithInviter } from "@/features/events/queries"
import { MAX_GUESTS_PER_MEMBER } from "@/features/events/schemas"
import { RemoveIcon } from "@/lib/icons"
import type { Viewer } from "@/lib/permissions"
import { canRemoveGuest } from "@/lib/permissions"

export async function EventGuests({
  eventId,
  guests,
  viewer,
  canAddGuests,
}: {
  eventId: string
  guests: EventGuestWithInviter[]
  viewer: Viewer | null
  /** False when the viewer isn't going, or the event is members-only. */
  canAddGuests: boolean
}) {
  const translateEvents = await getTranslations("Events")

  const broughtByViewer = guests.filter(
    (guest) => guest.invitedByMemberId === viewer?.member?.id,
  ).length
  const hasRoomForMore = broughtByViewer < MAX_GUESTS_PER_MEMBER

  return (
    <PageSection heading={translateEvents("guestsTitle")}>
      {guests.length === 0 ? (
        <EmptyState>{translateEvents("guestsEmpty")}</EmptyState>
      ) : (
        <div className="text-sm">
          <ItemList>
            {guests.map((guest) => (
              <li
                key={guest.id}
                className="flex items-center justify-between gap-3 p-3"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <GuestAvatar className="size-7" />
                  <span className="min-w-0">
                    <span className="block truncate">{guest.name}</span>
                    <span className="text-muted-foreground block text-xs">
                      {translateEvents("guestBroughtBy", {
                        memberName: guest.invitedByName,
                      })}
                    </span>
                  </span>
                </span>

                {canRemoveGuest(viewer, guest) && (
                  <form action={removeGuestAction}>
                    <input type="hidden" name="guestId" value={guest.id} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={translateEvents("guestRemove", {
                        guestName: guest.name,
                      })}
                    >
                      <RemoveIcon className="size-4" />
                    </Button>
                  </form>
                )}
              </li>
            ))}
          </ItemList>
        </div>
      )}

      {canAddGuests &&
        (hasRoomForMore ? (
          <form action={addGuestAction} className="mt-4 flex flex-wrap gap-2">
            <input type="hidden" name="eventId" value={eventId} />
            <Input
              name="name"
              required
              maxLength={80}
              placeholder={translateEvents("guestNamePlaceholder")}
              aria-label={translateEvents("guestNameLabel")}
              className="w-full sm:w-56"
            />
            <Button type="submit" size="sm">
              {translateEvents("guestAdd")}
            </Button>
          </form>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            {translateEvents("guestLimitReached", {
              count: MAX_GUESTS_PER_MEMBER,
            })}
          </p>
        ))}
    </PageSection>
  )
}
