// Posts due event reminders to Discord. Called by Vercel Cron once a day.
//
// Idempotent: each reminder is a row keyed on (event, offset) and is marked sent, so
// running this twice in one day posts nothing twice.

import { NextResponse } from "next/server"

import { postEventToDiscord } from "@/features/events/discord"
import {
  findUnsentRemindersForUpcomingEvents,
  markReminderSent,
} from "@/features/events/queries"
import { routing } from "@/i18n/routing"
import { reminderDueAt } from "@/lib/time"

function isAuthorised(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  // Refuse rather than run unprotected if the secret is missing.
  if (!cronSecret) return false

  return request.headers.get("authorization") === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const now = new Date()
  const pending = await findUnsentRemindersForUpcomingEvents()

  // A daily job can only catch a window, so anything already past due is sent now
  // rather than skipped — better a late reminder than none.
  const due = pending.filter(
    ({ event, offset }) => reminderDueAt(event.startsAt, offset) <= now,
  )

  const sent: string[] = []

  for (const { event, offset } of due) {
    const messageId = await postEventToDiscord({
      event,
      locale: routing.defaultLocale,
      leadText: "Påminnelse",
    })

    // Only mark it sent if Discord accepted it, so a webhook outage retries tomorrow.
    if (messageId !== null) {
      await markReminderSent(event.id, offset)
      sent.push(`${event.title} (${offset})`)
    }
  }

  return NextResponse.json({
    checked: pending.length,
    due: due.length,
    sent: sent.length,
    events: sent,
  })
}
