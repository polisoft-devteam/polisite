import type { Metadata } from "next"

import { notFound } from "next/navigation"
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { AttendeeAvatars } from "@/components/AttendeeAvatars"
import { EventDatePoll } from "@/components/EventDatePoll"
import { EventRsvp } from "@/components/EventRsvp"
import { EmptyState } from "@/components/EmptyState"
import { ExternalLink } from "@/components/ExternalLink"
import { Fact, FactList } from "@/components/FactList"
import { ItemList } from "@/components/ItemList"
import { BackLink } from "@/components/BackLink"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { SiteImage } from "@/components/SiteImage"
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
} from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { EditIcon, ExternalLinkIcon, GoogleIcon } from "@/lib/icons"
import {
  canEditEvent,
  canRespondToEvent,
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
}: PageProps<"/[locale]/events/[slug]">) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const format = await getFormatter({ locale })
  const viewer = await getViewer()

  const event = await findEventBySlug(slug, visibleEventVisibilitiesFor(viewer))

  // A forbidden event and a missing one give the same answer, so nobody can probe ids to
  // learn which members-only events exist.
  if (!event) notFound()

  const [attendees, dateOptions] = await Promise.all([
    findAttendeesForEvent(event.id),
    findDateOptionsForEvent(event.id, viewer?.member?.id ?? null),
  ])
  const goingAttendees = attendees.filter(
    (attendee) => attendee.response === "going",
  )
  const myResponse =
    attendees.find((attendee) => attendee.memberId === viewer?.member?.id)
      ?.response ?? null

  const spotsLeft =
    event.maxAttendees === null
      ? null
      : event.maxAttendees - goingAttendees.length

  return (
    <PageContainer>
      <BackLink href="/events">{translateEvents("back")}</BackLink>

      <div className="mt-4">
        <PageHeading
          eyebrow={translateEvents(EVENT_CATEGORY_LABEL_KEY[event.category])}
          title={event.title}
          actions={
            canEditEvent(viewer, event) && (
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
          }
        />
      </div>

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

          {event.location && (
            <Fact label={translateEvents("fieldLocation")}>
              {event.location}
              {/* A plain Maps search link needs no API key and no billing account. */}
              <ExternalLink
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                className="ml-2 text-sm"
              >
                <GoogleIcon className="size-3.5" />
                {translateEvents("showOnMap")}
              </ExternalLink>
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

      {event.imageUrl && (
        <div className="mt-6">
          <SiteImage
            src={event.imageUrl}
            alt=""
            className="aspect-video w-full max-w-2xl"
            sizes="(min-width: 768px) 42rem, 100vw"
            priority
          />
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

      {canRespondToEvent(viewer, event) ? (
        <EventRsvp eventId={event.id} myResponse={myResponse} />
      ) : (
        <p className="text-muted-foreground mt-6 text-sm">
          {translateEvents("signInToRespond")}
        </p>
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

      <PageSection heading={translateEvents("attendees")}>
        <AttendeeAvatars attendees={goingAttendees} />

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
                  <span>{attendee.nickname ?? attendee.fullName}</span>
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
    </PageContainer>
  )
}
