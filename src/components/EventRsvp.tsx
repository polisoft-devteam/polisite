// The going / maybe / can't-make-it buttons. Three plain forms posting to a server
// action, so no client JavaScript is involved.

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { attendanceResponseEnum, type AttendanceResponse } from "@/db/schema"
import { setAttendanceAction } from "@/features/events/actions"

const RESPONSE_TRANSLATION_KEY: Record<AttendanceResponse, string> = {
  going: "rsvpGoing",
  interested: "rsvpInterested",
  not_going: "rsvpNotGoing",
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
            {translateEvents(RESPONSE_TRANSLATION_KEY[response])}
          </Button>
        </form>
      ))}
    </div>
  )
}
