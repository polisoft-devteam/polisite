import type { Metadata } from "next"

import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import { findPastEvents, findUpcomingEvents } from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { PlusIcon } from "@/lib/icons"
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

  const [upcomingEvents, pastEvents] = await Promise.all([
    findUpcomingEvents(allowedVisibilities),
    findPastEvents(allowedVisibilities),
  ])

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
              <PlusIcon className="size-4" />
              {translateEvents("newEvent")}
            </Button>
          )
        }
      />

      <EventList
        heading={translateEvents("upcomingTitle")}
        emptyText={translateEvents("upcomingEmpty")}
        events={upcomingEvents}
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
