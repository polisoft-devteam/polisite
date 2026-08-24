// A grid of event cards under a heading, or an empty state.

import { EmptyState } from "@/components/EmptyState"
import { EventCard } from "@/components/EventCard"
import { PageSection } from "@/components/PageSection"
import type { Event } from "@/db/schema"
import { findGoingAttendeesByEvent } from "@/features/events/queries"

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

  // One query for the whole grid, not one per card.
  const attendeesByEvent = await findGoingAttendeesByEvent(
    events.map((event) => event.id),
  )

  return (
    <PageSection heading={heading}>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            attendees={attendeesByEvent.get(event.id) ?? []}
            locale={locale}
          />
        ))}
      </div>
    </PageSection>
  )
}
