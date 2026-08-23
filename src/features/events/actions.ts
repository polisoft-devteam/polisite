"use server"

import { revalidatePath } from "next/cache"
import { getLocale } from "next-intl/server"

import { postEventToDiscord } from "@/features/events/discord"
import {
  createEvent,
  deleteEvent,
  findEventById,
  findEventIdForDateOption,
  replaceDateOptions,
  setAttendance,
  setEventDateFromOption,
  toggleDateVote,
  updateEvent,
} from "@/features/events/queries"
import {
  eventFormSchema,
  readEventForm,
  toMinorUnits,
} from "@/features/events/schemas"
import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import {
  canCreateEvent,
  canEditEvent,
  canRespondToEvent,
  visibleEventVisibilitiesFor,
} from "@/lib/permissions"
import { deleteImageIfOurs, uploadImage } from "@/lib/storage"
import { wallTimeToInstant } from "@/lib/time"
import { attendanceResponseEnum } from "@/db/schema"

export async function createEventAction(formData: FormData) {
  const viewer = await getViewer()

  if (!canCreateEvent(viewer)) throw new Error("Not allowed to create events")

  const parsed = eventFormSchema.safeParse(readEventForm(formData))
  if (!parsed.success) return

  const form = parsed.data

  const uploadedImageUrl = await uploadImage(
    "event-images",
    formData.get("image") as File | null,
  )

  const event = await createEvent(
    {
      title: form.title,
      description: form.description,
      kind: form.kind,
      startsAt: form.startsAtWallTime
        ? wallTimeToInstant(form.startsAtWallTime, form.timeZone)
        : null,
      endsAt: form.endsAtWallTime
        ? wallTimeToInstant(form.endsAtWallTime, form.timeZone)
        : null,
      timeZone: form.timeZone,
      location: form.location,
      category: form.category,
      priceMinorUnits: toMinorUnits(form.price),
      priceCurrency: form.currency,
      maxAttendees: form.maxAttendees,
      imageUrl: uploadedImageUrl,
      eventUrl: form.eventUrl,
      extraLinkUrl: form.extraLinkUrl,
      visibility: form.visibility,
      createdByMemberId: viewer!.member!.id,
    },
    form.reminderOffsets,
  )

  await replaceDateOptions(
    event.id,
    form.dateOptions.map((wallTime) =>
      wallTimeToInstant(wallTime, form.timeZone),
    ),
  )

  const locale = await getLocale()

  if (form.announceOnDiscord) {
    // A failed announcement must not lose the event, so this never throws.
    const messageId = await postEventToDiscord({
      event,
      locale,
      leadText: "Nytt evenemang!",
    })

    if (messageId !== null) {
      await updateEvent(
        event.id,
        { discordAnnouncedAt: new Date(), discordMessageId: messageId },
        form.reminderOffsets,
      )
    }
  }

  revalidatePath("/", "layout")
  redirect({ href: `/events/${event.id}`, locale })
}

export async function updateEventAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")

  const existing = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  if (!existing || !canEditEvent(viewer, existing)) {
    throw new Error("Not allowed to edit this event")
  }

  const parsed = eventFormSchema.safeParse(readEventForm(formData))
  if (!parsed.success) return

  const form = parsed.data

  const uploadedImageUrl = await uploadImage(
    "event-images",
    formData.get("image") as File | null,
  )

  await updateEvent(
    eventId,
    {
      title: form.title,
      description: form.description,
      kind: form.kind,
      startsAt: form.startsAtWallTime
        ? wallTimeToInstant(form.startsAtWallTime, form.timeZone)
        : null,
      endsAt: form.endsAtWallTime
        ? wallTimeToInstant(form.endsAtWallTime, form.timeZone)
        : null,
      timeZone: form.timeZone,
      location: form.location,
      category: form.category,
      priceMinorUnits: toMinorUnits(form.price),
      priceCurrency: form.currency,
      maxAttendees: form.maxAttendees,
      ...(uploadedImageUrl ? { imageUrl: uploadedImageUrl } : {}),
      eventUrl: form.eventUrl,
      extraLinkUrl: form.extraLinkUrl,
      visibility: form.visibility,
    },
    form.reminderOffsets,
  )

  await replaceDateOptions(
    eventId,
    form.dateOptions.map((wallTime) =>
      wallTimeToInstant(wallTime, form.timeZone),
    ),
  )

  if (uploadedImageUrl) {
    await deleteImageIfOurs("event-images", existing.imageUrl)
  }

  revalidatePath("/", "layout")
  redirect({ href: `/events/${eventId}`, locale: await getLocale() })
}

export async function deleteEventAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")

  const existing = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  if (!existing || !canEditEvent(viewer, existing)) {
    throw new Error("Not allowed to delete this event")
  }

  await deleteEvent(eventId)
  await deleteImageIfOurs("event-images", existing.imageUrl)

  revalidatePath("/", "layout")
  redirect({ href: "/events", locale: await getLocale() })
}

export async function setAttendanceAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")
  const response = String(formData.get("response") ?? "")

  if (!attendanceResponseEnum.enumValues.includes(response as never)) {
    throw new Error("Unknown response")
  }

  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  if (!event || !canRespondToEvent(viewer, event)) {
    throw new Error("Not allowed to respond to this event")
  }

  await setAttendance(
    eventId,
    viewer!.member!.id,
    response as (typeof attendanceResponseEnum.enumValues)[number],
  )

  revalidatePath("/", "layout")
}

export async function toggleDateVoteAction(formData: FormData) {
  const viewer = await getViewer()
  const dateOptionId = String(formData.get("dateOptionId") ?? "")

  const eventId = await findEventIdForDateOption(dateOptionId)
  if (!eventId) throw new Error("Unknown date")

  // Re-checked here rather than trusted from the page that rendered the button.
  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )
  if (!event || !canRespondToEvent(viewer, event)) {
    throw new Error("Not allowed to vote on this event")
  }

  await toggleDateVote(dateOptionId, viewer!.member!.id)

  revalidatePath("/", "layout")
}

export async function chooseEventDateAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")
  const dateOptionId = String(formData.get("dateOptionId") ?? "")

  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  // Only whoever may edit the event decides which date wins.
  if (!event || !canEditEvent(viewer, event)) {
    throw new Error("Not allowed to set the date for this event")
  }

  await setEventDateFromOption(eventId, dateOptionId)

  revalidatePath("/", "layout")
}
