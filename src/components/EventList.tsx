// A grid of event cards under a heading, or an empty state.

import { EmptyState } from "@/components/EmptyState"
import { EventCard } from "@/components/EventCard"
import { PageSection } from "@/components/PageSection"
import type { Event } from "@/db/schema"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"
import {
  findGoingAttendeesByEvent,
  findGuestsByEvent,
} from "@/features/events/queries"

export async function EventList({
  heading,
  emptyText,
  events,
  locale,
}: {
  heading: string
  emptyText: string
  events: Event[]
  locale: string
}) {
  if (events.length === 0) {
    return (
      <PageSection heading={heading}>
        <EmptyState>{emptyText}</EmptyState>
      </PageSection>
    )
  }

  // Event detail is members only, so a guest's cards carry no link and no slug.
  const canOpen = isActiveMember(await getViewer())

  // One query each for the whole grid, not one per card.
  const eventIds = events.map((event) => event.id)
  const [attendeesByEvent, guestsByEvent] = await Promise.all([
    findGoingAttendeesByEvent(eventIds),
    findGuestsByEvent(eventIds),
  ])

  return (
    <PageSection heading={heading}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendees={attendeesByEvent.get(event.id) ?? []}
            guests={guestsByEvent.get(event.id) ?? []}
            locale={locale}
            canOpen={canOpen}
          />
        ))}
      </div>
    </PageSection>
  )
}
