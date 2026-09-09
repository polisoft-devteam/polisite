// Event cards under a heading, or an empty state.
//
// Two shapes. A grid fills the width of a page, which is what /events and a profile want.
// A column stacks them one under another, for the front page, where three of these stand
// side by side and each one is a list of its own.

import { EmptyState } from "@/components/EmptyState"
import { EventCard } from "@/components/EventCard"
import { PageSection } from "@/components/PageSection"
import type { Event } from "@/db/schema"
import { getViewer } from "@/lib/auth"
import { openableEventVisibilitiesFor } from "@/lib/permissions"
import {
  findGoingAttendeesByEvent,
  findGuestsByEvent,
} from "@/features/events/queries"

export async function EventList({
  heading,
  emptyText,
  events,
  locale,
  layout = "grid",
}: {
  heading: string
  emptyText: string
  events: Event[]
  locale: string
  layout?: "grid" | "column"
}) {
  if (events.length === 0) {
    return (
      <PageSection heading={heading}>
        <EmptyState>{emptyText}</EmptyState>
      </PageSection>
    )
  }

  // Event detail is members only, so a guest's cards carry no link and no slug.
  // Per event now, not per person: a signed-in visitor may open a public one and nothing
  // else. See openableEventVisibilitiesFor.
  const openable = openableEventVisibilitiesFor(await getViewer())

  // One query each for the whole grid, not one per card.
  const eventIds = events.map((event) => event.id)
  const [attendeesByEvent, guestsByEvent] = await Promise.all([
    findGoingAttendeesByEvent(eventIds),
    findGuestsByEvent(eventIds),
  ])

  return (
    <PageSection heading={heading}>
      <div
        className={
          layout === "column"
            ? "flex flex-col gap-4"
            : "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendees={attendeesByEvent.get(event.id) ?? []}
            guests={guestsByEvent.get(event.id) ?? []}
            locale={locale}
            canOpen={openable.includes(event.visibility)}
          />
        ))}
      </div>
    </PageSection>
  )
}
