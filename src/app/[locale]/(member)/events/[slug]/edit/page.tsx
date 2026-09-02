import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventForm } from "@/components/EventForm"
import { Modal, ModalClose } from "@/components/Modal"
import { NotAttendingIcon } from "@/lib/icons"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import {
  cancelEventAction,
  deleteEventAction,
  updateEventAction,
} from "@/features/events/actions"
import {
  findDateOptionsForEvent,
  findEventBySlug,
  findReminderOffsetsForEvent,
} from "@/features/events/queries"
import { getViewer } from "@/lib/auth"
import { canEditEvent, visibleEventVisibilitiesFor } from "@/lib/permissions"
import { instantToWallTime } from "@/lib/time"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/[slug]/edit">): Promise<Metadata> {
  const { locale } = await params
  const translateEvents = await getTranslations({
    locale,
    namespace: "Events",
  })

  return { title: translateEvents("editTitle") }
}

export default async function EditEventPage({
  params,
}: PageProps<"/[locale]/events/[slug]/edit">) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")
  const viewer = await getViewer()

  const event = await findEventBySlug(slug, visibleEventVisibilitiesFor(viewer))

  // Not the creator and not an admin gets the same answer as a missing event.
  if (!event || !canEditEvent(viewer, event)) notFound()

  const [reminderOffsets, dateOptions] = await Promise.all([
    findReminderOffsetsForEvent(event.id),
    findDateOptionsForEvent(event.id, viewer?.member?.id ?? null),
  ])

  return (
    <PageContainer>
      <div className="mt-4">
        <PageHeading title={translateEvents("editTitle")} />
      </div>

      <EventForm
        action={updateEventAction}
        submitLabel={translateEvents("saveChanges")}
        event={event}
        reminderOffsets={reminderOffsets}
        dateOptions={dateOptions.map((option) =>
          instantToWallTime(option.startsAt, event.timeZone),
        )}
      />

      <div className="mt-12 flex flex-wrap gap-2 border-t pt-6">
        {/* Calling it off is not deleting it: the page stays, so anyone following an old
            link learns it is off rather than meeting a not-found. Already cancelled, and
            there is nothing left to announce. */}
        {!event.cancelledAt && (
          <Modal
            trigger={
              <Button variant="outline" size="sm">
                <NotAttendingIcon className="size-4" />
                {translateEvents("cancelEvent")}
              </Button>
            }
            title={translateEvents("cancelEvent")}
            description={translateEvents("cancelEventConfirm")}
            closeLabel={translateEvents("close")}
            footer={
              <>
                <ModalClose render={<Button variant="outline" size="sm" />}>
                  {translateEvents("cancel")}
                </ModalClose>

                <form action={cancelEventAction}>
                  <input type="hidden" name="eventId" value={event.id} />
                  <Button type="submit" variant="destructive" size="sm">
                    {translateEvents("cancelEventConfirmAction")}
                  </Button>
                </form>
              </>
            }
          />
        )}

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
