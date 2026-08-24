// A row of overlapping avatars for whoever is coming, with a count.

import { getTranslations } from "next-intl/server"

import { MemberAvatar } from "@/components/MemberAvatar"
import type { Attendee } from "@/features/events/queries"

const MAX_SHOWN = 8

export async function AttendeeAvatars({
  attendees,
}: {
  attendees: Attendee[]
}) {
  const translateEvents = await getTranslations("Events")

  if (attendees.length === 0) return null

  const shown = attendees.slice(0, MAX_SHOWN)
  const hiddenCount = attendees.length - shown.length

  return (
    <div className="flex items-center gap-3">
      {/* Overlapped, with a ring so each circle stays distinct against its neighbour. */}
      <div className="flex">
        {shown.map((attendee) => (
          <MemberAvatar
            key={attendee.memberId}
            fullName={attendee.fullName}
            avatarUrl={attendee.avatarUrl}
            className="ring-background -ml-2 size-8 text-xs ring-2 first:ml-0"
          />
        ))}

        {hiddenCount > 0 && (
          <span className="bg-muted text-muted-foreground ring-background -ml-2 flex size-8 items-center justify-center rounded-full text-xs ring-2">
            +{hiddenCount}
          </span>
        )}
      </div>

      <span className="text-muted-foreground text-sm">
        {translateEvents("goingCount", { count: attendees.length })}
      </span>
    </div>
  )
}
