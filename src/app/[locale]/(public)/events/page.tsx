import type { Metadata } from "next"

import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import {
  findDatelessEvents,
  findPastEvents,
  findUpcomingEvents,
} from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { HoverSwapIcon } from "@/components/HoverSwapIcon"
import { EnvelopeIcon, NewEventIcon } from "@/lib/icons"
import { canCreateEvent, visibleEventVisibilitiesFor } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params
  const translateEvents = await getTranslations({
    locale,
    namespace: "Events",
  })

  return { title: translateEvents("title") }
}

export default async function EventsPage({
  params,
}: PageProps<"/[locale]/events">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const viewer = await getViewer()

  // A guest gets ["public"], a member gets ["public", "members"]. The filter happens in
  // SQL, so nothing they may not see is ever loaded.
  const allowedVisibilities = visibleEventVisibilitiesFor(viewer)

  const [upcomingEvents, datelessEvents, pastEvents] = await Promise.all([
    findUpcomingEvents(allowedVisibilities),
    findDatelessEvents(allowedVisibilities),
    findPastEvents(allowedVisibilities),
  ])

  // Split by kind rather than by whether a date is set: a suggestion with a date pencilled
  // in is still a suggestion, and used to sit among the events that are actually happening.
  // Every dateless event is a suggestion, because the schema refuses a confirmed one
  // without a date.
  const suggestedEvents = [
    ...datelessEvents,
    ...upcomingEvents.filter((event) => event.kind === "suggestion"),
  ]
  const confirmedEvents = upcomingEvents.filter(
    (event) => event.kind === "confirmed",
  )

  return (
    <PageContainer>
      <PageHeading
        title={translateEvents("title")}
        actions={
          canCreateEvent(viewer) && (
            <Button
              nativeButton={false}
              render={
                <Link href="/events/new" transitionTypes={["nav-forward"]} />
              }
            >
              <HoverSwapIcon
                Idle={EnvelopeIcon}
                Hover={NewEventIcon}
                className="size-4"
              />
              {translateEvents("newEvent")}
            </Button>
          )
        }
      />

      {/* A real blockquote rather than quote marks in the string, so the attribution has
          somewhere to sit and a screen reader knows it is a quotation. */}
      <figure className="mt-6 max-w-2xl">
        <blockquote className="border-border text-muted-foreground border-l-2 pl-4">
          {translateEvents("quote")}
        </blockquote>
        <figcaption className="text-muted-foreground mt-2 pl-4 text-xs italic">
          {translateEvents("quoteAttribution")}
        </figcaption>
      </figure>

      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateEvents("intro")}
      </p>

      <EventList
        heading={translateEvents("suggestionsTitle")}
        emptyText={translateEvents("suggestionsEmpty")}
        events={suggestedEvents}
        locale={locale}
      />

      <EventList
        heading={translateEvents("upcomingTitle")}
        emptyText={translateEvents("upcomingEmpty")}
        events={confirmedEvents}
        locale={locale}
      />

      <EventList
        heading={translateEvents("pastTitle")}
        emptyText={translateEvents("pastEmpty")}
        events={pastEvents}
        locale={locale}
      />
    </PageContainer>
  )
}
