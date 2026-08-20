import type { Metadata } from "next"
import { ArrowLeftIcon, PencilIcon } from "lucide-react"
import { notFound } from "next/navigation"
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { EventRsvp } from "@/components/EventRsvp"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import type { EventCategory } from "@/db/schema"
import { findAttendeesForEvent, findEventById } from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import {
  canEditEvent,
  canRespondToEvent,
  visibleEventVisibilitiesFor,
} from "@/lib/permissions"

const CATEGORY_TRANSLATION_KEY: Record<EventCategory, string> = {
  music: "categoryMusic",
  party: "categoryParty",
  trip: "categoryTrip",
  hike: "categoryHike",
  sport: "categorySport",
  food: "categoryFood",
  board_meeting: "categoryBoardMeeting",
  birthday: "categoryBirthday",
  other: "categoryOther",
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/[eventId]">): Promise<Metadata> {
  const { locale, eventId } = await params
  const viewer = await getViewer()
  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

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
}: PageProps<"/[locale]/events/[eventId]">) {
  const { locale, eventId } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const format = await getFormatter({ locale })
  const viewer = await getViewer()

  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  // A forbidden event and a missing one give the same answer, so nobody can probe ids to
  // learn which members-only events exist.
  if (!event) notFound()

  const attendees = await findAttendeesForEvent(event.id)
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
      <Button
        nativeButton={false}
        render={<Link href="/events" transitionTypes={["nav-back"]} />}
        variant="ghost"
        size="sm"
        className="-ml-3"
      >
        <ArrowLeftIcon className="size-4" />
        {translateEvents("back")}
      </Button>

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {translateEvents(CATEGORY_TRANSLATION_KEY[event.category])}
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {event.title}
          </h1>
        </div>

        {canEditEvent(viewer, event) && (
          <Button
            nativeButton={false}
            render={
              <Link
                href={`/events/${event.id}/edit`}
                transitionTypes={["nav-forward"]}
              />
            }
            variant="outline"
            size="sm"
          >
            <PencilIcon className="size-4" />
            {translateEvents("edit")}
          </Button>
        )}
      </div>

      <dl className="mt-6 space-y-1 text-sm">
        <Fact label={translateEvents("fieldStartsAt")}>
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
          <Fact label={translateEvents("fieldLocation")}>{event.location}</Fact>
        )}

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
      </dl>

      {event.description && (
        <p className="mt-6 max-w-2xl text-sm whitespace-pre-line">
          {event.description}
        </p>
      )}

      {(event.eventUrl || event.extraLinkUrl) && (
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          {event.eventUrl && (
            <a
              href={event.eventUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              {translateEvents("moreInfo")}
            </a>
          )}
          {event.extraLinkUrl && (
            <a
              href={event.extraLinkUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="underline underline-offset-4"
            >
              {translateEvents("extraLink")}
            </a>
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

      <section className="mt-12">
        <h2 className="text-lg font-medium">{translateEvents("attendees")}</h2>

        {attendees.length === 0 ? (
          <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
            {translateEvents("attendeesEmpty")}
          </p>
        ) : (
          <ul className="mt-4 divide-y rounded-lg border text-sm">
            {attendees.map((attendee) => (
              <li
                key={attendee.memberId}
                className="flex justify-between gap-4 p-3"
              >
                <span>{attendee.nickname ?? attendee.fullName}</span>
                <span className="text-muted-foreground">
                  {translateEvents(
                    attendee.response === "going"
                      ? "rsvpGoing"
                      : attendee.response === "interested"
                        ? "rsvpInterested"
                        : "rsvpNotGoing",
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </PageContainer>
  )
}

function Fact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <dt className="text-muted-foreground">{label}:</dt>
      <dd>{children}</dd>
    </div>
  )
}
