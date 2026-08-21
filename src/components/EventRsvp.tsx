// The going / maybe / can't-make-it buttons. Three plain forms posting to a server
// action, so no client JavaScript is involved.

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { attendanceResponseEnum, type AttendanceResponse } from "@/db/schema"
import { ATTENDANCE_RESPONSE_LABEL_KEY } from "@/features/events/labels"
import { setAttendanceAction } from "@/features/events/actions"

export async function EventRsvp({
  eventId,
  myResponse,
}: {
  eventId: string
  myResponse: AttendanceResponse | null
}) {
  const translateEvents = await getTranslations("Events")

  return (
    <div className="mt-6 flex flex-wrap gap-2">
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
