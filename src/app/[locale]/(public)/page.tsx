// The front page. Two audiences share it: a visitor who may not know what Poli is, and a
// member who came here to see what's next. Both get the same shape — the difference is
// what the query returns, not what the page hides.

import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import { findUpcomingEvents } from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { ChevronRightIcon, PlusIcon } from "@/lib/icons"
import {
  canCreateEvent,
  isActiveMember,
  visibleEventVisibilitiesFor,
} from "@/lib/permissions"

// Enough to fill one row of cards. The rest live on /events.
const EVENTS_SHOWN = 3

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateHome = await getTranslations("Home")
  const viewer = await getViewer()

  // A visitor gets ["public"], a member also gets the association's own events. Filtered
  // in SQL, so nothing they may not see is ever loaded.
  const upcomingEvents = await findUpcomingEvents(
    visibleEventVisibilitiesFor(viewer),
  )
  const shownEvents = upcomingEvents.slice(0, EVENTS_SHOWN)

  return (
    <PageContainer>
      <PageHeading
        title={translateHome("title")}
        actions={
          canCreateEvent(viewer) && (
            <Button
              nativeButton={false}
              render={
                <Link href="/events/new" transitionTypes={["nav-forward"]} />
              }
            >
              <PlusIcon className="size-4" />
              {translateHome("newEvent")}
            </Button>
          )
        }
      />

      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateHome("intro")}
      </p>

      <EventList
        heading={translateHome("upcomingTitle")}
        emptyText={translateHome("upcomingEmpty")}
        events={shownEvents}
        locale={locale}
      />

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href="/events" transitionTypes={["nav-forward"]} />}
        >
          {translateHome("allEvents")}
          <ChevronRightIcon className="size-4" />
        </Button>

        {!isActiveMember(viewer) && (
          <p className="text-muted-foreground text-sm">
            {translateHome("visitorNote")}
          </p>
        )}
      </div>
    </PageContainer>
  )
}
