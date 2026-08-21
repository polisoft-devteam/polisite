import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventForm } from "@/components/EventForm"
import { BackLink } from "@/components/BackLink"
import { Modal, ModalClose } from "@/components/Modal"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import { deleteEventAction, updateEventAction } from "@/features/events/actions"
import {
  findEventById,
  findReminderOffsetsForEvent,
} from "@/features/events/queries"
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
      <BackLink href={`/events/${event.id}`}>{event.title}</BackLink>

      <div className="mt-4">
        <PageHeading title={translateEvents("editTitle")} />
      </div>

      <EventForm
        action={updateEventAction}
        submitLabel={translateEvents("save")}
        event={event}
        reminderOffsets={reminderOffsets}
      />

      <div className="mt-12 border-t pt-6">
        <Modal
          trigger={
            <Button variant="destructive" size="sm">
              {translateEvents("delete")}
            </Button>
          }
          title={translateEvents("delete")}
          description={translateEvents("deleteConfirm")}
          closeLabel={translateEvents("close")}
          footer={
            <>
              <ModalClose render={<Button variant="outline" size="sm" />}>
                {translateEvents("cancel")}
              </ModalClose>

              <form action={deleteEventAction}>
                <input type="hidden" name="eventId" value={event.id} />
                <Button type="submit" variant="destructive" size="sm">
                  {translateEvents("delete")}
                </Button>
              </form>
            </>
          }
        />
      </div>
    </PageContainer>
  )
}
