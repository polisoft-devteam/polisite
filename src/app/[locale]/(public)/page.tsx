// The front page. Two audiences share it: a visitor who may not know what Poli is, and a
// member who came here to see what's next. Both get the same shape — the difference is
// what the query returns, not what the page hides.

import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { PageContainer } from "@/components/PageContainer"
import { SiteHero } from "@/components/SiteHero"
import { Button } from "@/components/ui/button"
import {
  findDatelessEvents,
  findOngoingEvents,
  findUpcomingEvents,
} from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { ChevronRightIcon, NewEventIcon } from "@/lib/icons"
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
  const allowedVisibilities = visibleEventVisibilitiesFor(viewer)

  const [upcomingEvents, ongoingEvents, datelessEvents] = await Promise.all([
    findUpcomingEvents(allowedVisibilities),
    findOngoingEvents(allowedVisibilities),
    findDatelessEvents(allowedVisibilities),
  ])

  const shownEvents = upcomingEvents.slice(0, EVENTS_SHOWN)
  // Every dateless one, not a slice: a poll is only worth anything while people are still
  // voting in it, and there are never many at once.
  const votableEvents = datelessEvents

  return (
    <>
      {/* Full bleed, so it sits outside the container every other page lines up with. */}
      <SiteHero />

      <PageContainer belowHero>
        <p className="text-muted-foreground max-w-2xl">
          {translateHome("intro")}
        </p>

        {/* Three lists side by side from lg, stacked before that: what is coming, what
            is waiting on a vote, and what is happening this minute. Each keeps its empty
            state rather than disappearing, so the columns stay where the eye left them. */}
        <div className="grid gap-x-8 lg:grid-cols-3">
          <EventList
            heading={translateHome("upcomingTitle")}
            emptyText={translateHome("upcomingEmpty")}
            events={shownEvents}
            locale={locale}
            layout="column"
          />

          <EventList
            heading={translateHome("votableTitle")}
            emptyText={translateHome("votableEmpty")}
            events={votableEvents}
            locale={locale}
            layout="column"
          />

          <EventList
            heading={translateHome("ongoingTitle")}
            emptyText={translateHome("ongoingEmpty")}
            events={ongoingEvents}
            locale={locale}
            layout="column"
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button
            nativeButton={false}
            variant="outline"
            render={<Link href="/events" transitionTypes={["nav-forward"]} />}
          >
            {translateHome("allEvents")}
            <ChevronRightIcon className="size-4" />
          </Button>

          {/* The h1 lives in the hero now, so this is where creating one belongs. */}
          {canCreateEvent(viewer) && (
            <Button
              nativeButton={false}
              render={
                <Link href="/events/new" transitionTypes={["nav-forward"]} />
              }
            >
              <NewEventIcon className="size-4" />
              {translateHome("newEvent")}
            </Button>
          )}

          {!isActiveMember(viewer) && (
            <p className="text-muted-foreground text-sm">
              {translateHome("visitorNote")}
            </p>
          )}
        </div>
      </PageContainer>
    </>
  )
}
