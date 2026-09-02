"use server"

import { revalidatePath } from "next/cache"
import { getLocale } from "next-intl/server"

import { postEventToDiscord } from "@/features/events/discord"
import {
  addGuest,
  countGuestsBroughtBy,
  cancelEvent,
  createEvent,
  deleteEvent,
  findAttendanceResponse,
  findEventById,
  findEventIdForDateOption,
  findGuestById,
  removeGuest,
  replaceDateOptions,
  setAttendance,
  setEventDateFromOption,
  toggleDateVote,
  updateEvent,
} from "@/features/events/queries"
import {
  eventFormSchema,
  guestFormSchema,
  MAX_GUESTS_PER_MEMBER,
  readEventForm,
  removeGuestFormSchema,
  toMinorUnits,
} from "@/features/events/schemas"
import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import {
  canBringGuests,
  canCreateEvent,
  canDeleteEvent,
  canEditEvent,
  canRemoveGuest,
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
      // An online event keeps no address, so ticking the box can't leave a stale one.
      location: form.isOnline ? null : form.location,
      isOnline: form.isOnline,
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

  // Whoever arranges it is coming, so don't make them click that separately.
  await setAttendance(event.id, viewer!.member!.id, "going")

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
  // The flag is what the event page celebrates on arrival; see CelebrateOnMount.
  redirect({ href: `/events/${event.slug}?created=1`, locale })
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
      // An online event keeps no address, so ticking the box can't leave a stale one.
      location: form.isOnline ? null : form.location,
      isOnline: form.isOnline,
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
  // The slug is frozen at creation, so an edited title keeps the same URL.
  redirect({ href: `/events/${existing.slug}`, locale: await getLocale() })
}

export async function deleteEventAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")

  const existing = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  if (!existing || !canDeleteEvent(viewer, existing)) {
    throw new Error("Not allowed to delete this event")
  }

  await deleteEvent(eventId)
  await deleteImageIfOurs("event-images", existing.imageUrl)

  revalidatePath("/", "layout")
  redirect({ href: "/events", locale: await getLocale() })
}

/**
 * Calls an event off and tells the channel.
 *
 * Not a delete: people answered it, and the page stays so anyone following an old link
 * learns it is off rather than meeting a not-found. Whoever may edit it may call it off,
 * which is its creator or an admin.
 */
export async function cancelEventAction(formData: FormData) {
  const viewer = await getViewer()
  const eventId = String(formData.get("eventId") ?? "")

  const existing = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )

  if (!existing || !canEditEvent(viewer, existing)) {
    throw new Error("Not allowed to cancel this event")
  }

  // Only announce if this call is the one that cancelled it, so a double submit cannot
  // ping the channel twice.
  if (await cancelEvent(eventId)) {
    await postEventToDiscord({
      event: { ...existing, cancelledAt: new Date() },
      locale: await getLocale(),
      leadText: "Inställt!",
    })
  }

  revalidatePath("/", "layout")
  redirect({ href: `/events/${existing.slug}`, locale: await getLocale() })
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

export async function addGuestAction(formData: FormData) {
  const viewer = await getViewer()

  const parsed = guestFormSchema.safeParse({
    eventId: String(formData.get("eventId") ?? ""),
    name: String(formData.get("name") ?? ""),
  })
  if (!parsed.success) return

  const { eventId, name } = parsed.data

  const event = await findEventById(
    eventId,
    visibleEventVisibilitiesFor(viewer),
  )
  if (!event) throw new Error("Unknown event")

  const memberId = viewer?.member?.id
  if (!memberId) throw new Error("Not allowed to bring guests to this event")

  const myResponse = await findAttendanceResponse(eventId, memberId)

  if (!canBringGuests(viewer, event, myResponse)) {
    throw new Error("Not allowed to bring guests to this event")
  }

  const alreadyBrought = await countGuestsBroughtBy(eventId, memberId)
  if (alreadyBrought >= MAX_GUESTS_PER_MEMBER) return

  await addGuest(eventId, memberId, name)

  revalidatePath("/", "layout")
}

export async function removeGuestAction(formData: FormData) {
  const viewer = await getViewer()

  const parsed = removeGuestFormSchema.safeParse({
    guestId: String(formData.get("guestId") ?? ""),
  })
  if (!parsed.success) return

  const guest = await findGuestById(parsed.data.guestId)
  if (!guest) return

  // Re-read the event so someone who has lost access can't still reach in and edit it.
  const event = await findEventById(
    guest.eventId,
    visibleEventVisibilitiesFor(viewer),
  )
  if (!event || !canRemoveGuest(viewer, guest)) {
    throw new Error("Not allowed to remove this guest")
  }

  await removeGuest(guest.id)

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
