// The going / maybe / can't-make-it buttons. Three plain forms posting to a server
// action, so no client JavaScript is involved.
//
// Until you have answered they pulse, because an unanswered event otherwise looks exactly
// like one you have already dealt with. The pulse stops as soon as a response is stored.

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { attendanceResponseEnum, type AttendanceResponse } from "@/db/schema"
import { ATTENDANCE_RESPONSE_LABEL_KEY } from "@/features/events/labels"
import { setAttendanceAction } from "@/features/events/actions"
import { cn } from "@/lib/utils"

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
          <Button
            type="submit"
            variant={myResponse === response ? "default" : "outline"}
            size="sm"
          >
            {translateEvents(ATTENDANCE_RESPONSE_LABEL_KEY[response])}
          </Button>
        </form>
      ))}
    </div>
  )
}
