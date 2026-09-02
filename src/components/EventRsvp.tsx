// The going / maybe / can't-make-it buttons. Three plain forms posting to a server
// action, so no client JavaScript is involved.
//
// Until you have answered they pulse, because an unanswered event otherwise looks exactly
// like one you have already dealt with. The pulse stops as soon as a response is stored.

import { getTranslations } from "next-intl/server"

import { CelebrateGoing } from "@/components/CelebrateGoing"
import { Button } from "@/components/ui/button"
import { attendanceResponseEnum, type AttendanceResponse } from "@/db/schema"
import { ATTENDANCE_RESPONSE_LABEL_KEY } from "@/features/events/labels"
import { setAttendanceAction } from "@/features/events/actions"
import { cn } from "@/lib/utils"

// By meaning rather than by hue, so the colours live in globals.css with the rest of the
// palette. Only the answer you picked is coloured; the other two stay plain outlines, or
// three tinted buttons would read as three states at once.
const SELECTED_RESPONSE_STYLE: Record<AttendanceResponse, string> = {
  going:
    "border-rsvp-going/40 bg-rsvp-going/15 text-rsvp-going hover:bg-rsvp-going/25",
  interested:
    "border-rsvp-interested/40 bg-rsvp-interested/15 text-rsvp-interested hover:bg-rsvp-interested/25",
  not_going:
    "border-rsvp-not-going/40 bg-rsvp-not-going/15 text-rsvp-not-going hover:bg-rsvp-not-going/25",
}

export async function EventRsvp({
  eventId,
  myResponse,
}: {
  eventId: string
  myResponse: AttendanceResponse | null
}) {
  const translateEvents = await getTranslations("Events")

  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap gap-2",
        myResponse === null && "rsvp-unanswered",
      )}
    >
      {attendanceResponseEnum.enumValues.map((response) => (
        <form key={response} action={setAttendanceAction}>
          <input type="hidden" name="eventId" value={eventId} />
          <input type="hidden" name="response" value={response} />
          {/* Only "going" is worth paper; the other two answers post plainly. */}
          {response === "going" ? (
            <CelebrateGoing
              label={translateEvents(ATTENDANCE_RESPONSE_LABEL_KEY[response])}
              isSelected={myResponse === response}
              className={cn(
                myResponse === response && SELECTED_RESPONSE_STYLE[response],
              )}
            />
          ) : (
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className={cn(
                // Floods with the primary colour on hover; see globals.css.
                "water-fill",
                myResponse === response && SELECTED_RESPONSE_STYLE[response],
              )}
            >
              {translateEvents(ATTENDANCE_RESPONSE_LABEL_KEY[response])}
            </Button>
          )}
        </form>
      ))}
    </div>
  )
}
