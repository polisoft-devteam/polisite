// A row of overlapping avatars for whoever is coming, with a count.
// Members show their picture or initials; guests brought along show a face icon.

import { getTranslations } from "next-intl/server"

import { GuestAvatar, MemberAvatar } from "@/components/MemberAvatar"
import type { Attendee, EventGuestWithInviter } from "@/features/events/queries"

const MAX_SHOWN = 8

export async function AttendeeAvatars({
  attendees,
  guests = [],
}: {
  attendees: Attendee[]
  guests?: EventGuestWithInviter[]
}) {
  const translateEvents = await getTranslations("Events")

  const totalComing = attendees.length + guests.length
  if (totalComing === 0) return null

  const shownAttendees = attendees.slice(0, MAX_SHOWN)
  const shownGuests = guests.slice(
    0,
    Math.max(0, MAX_SHOWN - shownAttendees.length),
  )
  const hiddenCount = totalComing - shownAttendees.length - shownGuests.length

  return (
    <div className="flex items-center gap-3">
      {/* Overlapped, with a ring so each circle stays distinct against its neighbour. */}
      <div className="flex">
        {shownAttendees.map((attendee) => (
          <MemberAvatar
            key={attendee.memberId}
            fullName={attendee.fullName}
            avatarUrl={attendee.avatarUrl}
            className="ring-background -ml-2 size-8 text-xs ring-2 first:ml-0"
          />
        ))}

        {shownGuests.map((guest) => (
          <GuestAvatar
            key={guest.id}
            className="ring-background -ml-2 size-8 ring-2 first:ml-0"
          />
        ))}

        {hiddenCount > 0 && (
          <span className="bg-muted text-muted-foreground ring-background -ml-2 flex size-8 items-center justify-center rounded-full text-xs ring-2">
            +{hiddenCount}
          </span>
        )}
      </div>

      <span className="text-muted-foreground text-sm">
        {translateEvents("goingCount", { count: totalComing })}
      </span>
    </div>
  )
}
