import type { Metadata } from "next"
import { ArrowLeftIcon } from "lucide-react"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventForm } from "@/components/EventForm"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import { deleteEventAction, updateEventAction } from "@/features/events/actions"
import {
  findEventById,
  findReminderOffsetsForEvent,
} from "@/features/events/queries"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { canEditEvent, visibleEventVisibilitiesFor } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/[eventId]/edit">): Promise<Metadata> {
  const { locale } = await params
  const translateEvents = await getTranslations({
    locale,
    namespace: "Events",
  })

  return { title: translateEvents("editTitle") }
}

export default async function EditEventPage({
  params,
}: PageProps<"/[locale]/events/[eventId]/edit">) {
  const { locale, eventId } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const viewer = await getViewer()

  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  // Not the creator and not an admin gets the same answer as a missing event.
  if (!event || !canEditEvent(viewer, event)) notFound()

  const reminderOffsets = await findReminderOffsetsForEvent(event.id)

  return (
    <PageContainer>
      <Button
        nativeButton={false}
        render={
          <Link href={`/events/${event.id}`} transitionTypes={["nav-back"]} />
        }
        variant="ghost"
        size="sm"
        className="-ml-3"
      >
        <ArrowLeftIcon className="size-4" />
        {event.title}
      </Button>

      <div className="mt-4">
        <PageHeading title={translateEvents("editTitle")} />
      </div>

      <EventForm
        action={updateEventAction}
        submitLabel={translateEvents("save")}
        event={event}
        reminderOffsets={reminderOffsets}
      />

      <form action={deleteEventAction} className="mt-12 border-t pt-6">
        <input type="hidden" name="eventId" value={event.id} />
        <Button type="submit" variant="outline" size="sm">
          {translateEvents("delete")}
        </Button>
      </form>
    </PageContainer>
  )
}
