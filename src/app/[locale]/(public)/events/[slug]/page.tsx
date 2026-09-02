import type { Metadata } from "next"

import { notFound } from "next/navigation"
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { AttendeeAvatars } from "@/components/AttendeeAvatars"
import { EventDatePoll } from "@/components/EventDatePoll"
import { EventGuests } from "@/components/EventGuests"
import { EventMap } from "@/components/EventMap"
import { MemberLink } from "@/components/MemberLink"
import { EventRsvp } from "@/components/EventRsvp"
import { EmptyState } from "@/components/EmptyState"
import { ExternalLink } from "@/components/ExternalLink"
import { Fact, FactList } from "@/components/FactList"
import { ItemList } from "@/components/ItemList"
import { BackLink } from "@/components/BackLink"
import { CelebrateOnMount } from "@/components/CelebrateOnMount"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { PhotoHero } from "@/components/PhotoHero"
import { SuggestionCallout } from "@/components/SuggestionCallout"
import { Button } from "@/components/ui/button"
import {
  EVENT_CATEGORY_LABEL_KEY,
  EVENT_VISIBILITY_LABEL_KEY,
  ATTENDANCE_RESPONSE_LABEL_KEY,
} from "@/features/events/labels"
import {
  findAttendeesForEvent,
  findDateOptionsForEvent,
  findEventBySlug,
  findEventHost,
  findGuestsForEvent,
} from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { findBadge } from "@/features/members/badges"
import { getViewer } from "@/lib/auth"
import {
  EditIcon,
  ExternalLinkIcon,
  NotAttendingIcon,
  OnlineIcon,
} from "@/lib/icons"
import {
  canBringGuests,
  canEditEvent,
  canRespondToEvent,
  isActiveMember,
  visibleEventVisibilitiesFor,
} from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params
  const viewer = await getViewer()
  const event = await findEventBySlug(slug, visibleEventVisibilitiesFor(viewer))

  if (!event) {
    const translateEvents = await getTranslations({
      locale,
      namespace: "Events",
    })
    return { title: translateEvents("title") }
  }

  return { title: event.title }
}

export default async function EventPage({
  params,
  searchParams,
}: PageProps<"/[locale]/events/[slug]">) {
  const { locale, slug } = await params
  // Set by the redirect after creating one, so the page it lands on celebrates once.
  const { created } = await searchParams
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const translateBadges = await getTranslations("Badges")
  const format = await getFormatter({ locale })
  const viewer = await getViewer()

  const event = await findEventBySlug(slug, visibleEventVisibilitiesFor(viewer))

  // A forbidden event and a missing one give the same answer, so nobody can probe ids to
  // learn which members-only events exist.
  //
  // Detail is members only whatever the event's visibility: a guest sees the card on the
  // list and gets the modal, so reaching this page by typing the URL must fail the same
  // way an unknown slug does.
  if (!event || !isActiveMember(viewer)) notFound()

  const [attendees, dateOptions, guests, host] = await Promise.all([
    findAttendeesForEvent(event.id),
    findDateOptionsForEvent(event.id, viewer?.member?.id ?? null),
    findGuestsForEvent(event.id),
    findEventHost(event),
  ])
  const goingAttendees = attendees.filter(
    (attendee) => attendee.response === "going",
  )
  const myResponse =
    attendees.find((attendee) => attendee.memberId === viewer?.member?.id)
      ?.response ?? null

  // Guests take up a place too, so the count is everyone actually turning up.
  const spotsLeft =
    event.maxAttendees === null
      ? null
      : event.maxAttendees - goingAttendees.length - guests.length

  const categoryLabel = translateEvents(
    EVENT_CATEGORY_LABEL_KEY[event.category],
  )

  const editButton = canEditEvent(viewer, event) && (
    <Button
      nativeButton={false}
      render={
        <Link
          href={`/events/${event.slug}/edit`}
          transitionTypes={["nav-forward"]}
        />
      }
      variant="outline"
    >
      <EditIcon className="size-4" />
      {translateEvents("edit")}
    </Button>
  )

  // The event's own photograph becomes the hero. Without one there is nothing to put a
  // title on, so the page falls back to the same heading every other page uses.
  const heroImage = event.imageUrl

  const rsvp = canRespondToEvent(viewer, event) ? (
    <EventRsvp eventId={event.id} myResponse={myResponse} />
  ) : (
    <p className="text-muted-foreground mt-6 text-sm">
      {translateEvents("signInToRespond")}
    </p>
  )

  return (
    <>
      {created && <CelebrateOnMount seed={event.createdAt.getTime()} />}

      {heroImage && (
        <PhotoHero
          images={[heroImage]}
          eyebrow={categoryLabel}
          title={event.title}
          note={
            event.kind === "suggestion" ? <SuggestionCallout onPhoto /> : null
          }
        />
      )}

      <PageContainer belowHero={heroImage !== null}>
        <div className="flex items-center justify-between gap-4">
          <BackLink href="/events">{translateEvents("back")}</BackLink>
          {heroImage && editButton}
        </div>

        {!heroImage && (
          <div className="mt-4">
            <PageHeading
              eyebrow={categoryLabel}
              title={event.title}
              actions={editButton}
            />
            {event.kind === "suggestion" && <SuggestionCallout />}
          </div>
        )}

        {/* Said before anything else: someone opening an old link needs to know before
            they read the time and place. */}
        {event.cancelledAt ? (
          <p className="border-destructive/40 bg-destructive/10 text-destructive mt-6 flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium">
            <NotAttendingIcon className="size-4" />
            {translateEvents("cancelled")}
          </p>
        ) : (
          /* Answering is the point of opening this page, so it comes before the detail. */
          rsvp
        )}

        <EventDatePoll
          eventId={event.id}
          timeZone={event.timeZone}
          options={dateOptions}
          chosenStartsAt={event.startsAt}
          canVote={canRespondToEvent(viewer, event)}
          canChooseDate={canEditEvent(viewer, event)}
          locale={locale}
        />

        <div className="mt-6">
          <FactList>
            <Fact label={translateEvents("fieldStartsAt")}>
              {event.startsAt ? (
                <>
                  <time dateTime={event.startsAt.toISOString()}>
                    {format.dateTime(event.startsAt, {
                      dateStyle: "full",
                      timeStyle: "short",
                      timeZone: event.timeZone,
                    })}
                  </time>
                  {/* Named so a reader in Copenhagen knows which city's clock this is. */}
                  <span className="text-muted-foreground">
                    {" "}
                    ({event.timeZone.replace("_", " ")})
                  </span>
                </>
              ) : (
                <span className="italic">
                  {translateEvents("dateNotDecided")}
                </span>
              )}
            </Fact>

            {event.endsAt && (
              <Fact label={translateEvents("fieldEndsAt")}>
                <time dateTime={event.endsAt.toISOString()}>
                  {format.dateTime(event.endsAt, {
                    dateStyle: "full",
                    timeStyle: "short",
                    timeZone: event.timeZone,
                  })}
                </time>
              </Fact>
            )}

            {event.isOnline ? (
              <Fact label={translateEvents("fieldLocation")}>
                <span className="flex items-center gap-2">
                  <OnlineIcon className="text-muted-foreground size-4" />
                  {translateEvents("locationOnline")}
                </span>
              </Fact>
            ) : (
              event.location && (
                <Fact label={translateEvents("fieldLocation")}>
                  {event.location}
                </Fact>
              )
            )}

            {host && (
              <Fact label={translateEvents("host")}>
                <MemberLink member={host} size="sm" />
              </Fact>
            )}

            <Fact label={translateEvents("fieldVisibility")}>
              {translateEvents(EVENT_VISIBILITY_LABEL_KEY[event.visibility])}
            </Fact>

            <Fact label={translateEvents("fieldPrice")}>
              {event.priceMinorUnits === null
                ? translateEvents("free")
                : `${(event.priceMinorUnits / 100).toFixed(2)} ${event.priceCurrency}`}
            </Fact>

            <Fact label={translateEvents("fieldMaxAttendees")}>
              {spotsLeft === null
                ? translateEvents("unlimited")
                : spotsLeft > 0
                  ? translateEvents("spotsLeft", { count: spotsLeft })
                  : translateEvents("full")}
            </Fact>
          </FactList>
        </div>

        {!event.isOnline && event.location && (
          <div className="mt-6">
            <EventMap location={event.location} />
          </div>
        )}

        {event.description && (
          <p className="mt-6 max-w-2xl text-sm whitespace-pre-line">
            {event.description}
          </p>
        )}

        {(event.eventUrl || event.extraLinkUrl) && (
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            {event.eventUrl && (
              <ExternalLink href={event.eventUrl}>
                <ExternalLinkIcon className="size-3.5" />
                {translateEvents("moreInfo")}
              </ExternalLink>
            )}
            {event.extraLinkUrl && (
              <ExternalLink href={event.extraLinkUrl}>
                <ExternalLinkIcon className="size-3.5" />
                {translateEvents("extraLink")}
              </ExternalLink>
            )}
          </div>
        )}

        <PageSection heading={translateEvents("attendees")}>
          <AttendeeAvatars attendees={goingAttendees} guests={guests} />

          {attendees.length === 0 ? (
            <EmptyState>{translateEvents("attendeesEmpty")}</EmptyState>
          ) : (
            <div className="text-sm">
              <ItemList>
                {attendees.map((attendee) => (
                  <li
                    key={attendee.memberId}
                    className="flex justify-between gap-4 p-3"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">
                        {attendee.nickname ?? attendee.fullName}
                      </span>
                      {attendee.displayedBadge &&
                        findBadge(attendee.displayedBadge) && (
                          <span className="text-muted-foreground block text-xs">
                            {translateBadges(
                              `${attendee.displayedBadge}.title`,
                            )}
                          </span>
                        )}
                    </span>
                    <span className="text-muted-foreground">
                      {translateEvents(
                        ATTENDANCE_RESPONSE_LABEL_KEY[attendee.response],
                      )}
                    </span>
                  </li>
                ))}
              </ItemList>
            </div>
          )}
        </PageSection>

        {event.visibility !== "members" && (
          <EventGuests
            eventId={event.id}
            guests={guests}
            viewer={viewer}
            canAddGuests={canBringGuests(viewer, event, myResponse)}
          />
        )}
      </PageContainer>
    </>
  )
}
