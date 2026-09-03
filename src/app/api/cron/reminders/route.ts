// Posts due event reminders and birthday greetings to Discord. Called by Vercel Cron once
// a day, which is all the Hobby plan allows, so both share the one run.
//
// Idempotent: each reminder is a row keyed on (event, offset) and is marked sent, so
// running this twice in one day posts nothing twice.

import { NextResponse } from "next/server"

import { postEventToDiscord } from "@/features/events/discord"
import {
  findUnsentRemindersForUpcomingEvents,
  markReminderSent,
} from "@/features/events/queries"
import { syncAutomaticBadgesForEveryone } from "@/features/members/badge-sync"
import {
  postBirthdayToDiscord,
  postCronFailureToDiscord,
} from "@/features/members/discord"
import { memberDisplayName } from "@/features/members/identity"
import {
  findMembersToGreet,
  markBirthdayGreeted,
} from "@/features/members/queries"
import { routing } from "@/i18n/routing"
import { DEFAULT_EVENT_TIME_ZONE, reminderDueAt } from "@/lib/time"

function isAuthorised(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  // Refuse rather than run unprotected if the secret is missing.
  if (!cronSecret) return false

  return request.headers.get("authorization") === `Bearer ${cronSecret}`
}

/**
 * Wishes everyone with a birthday today a happy one, in a single message.
 *
 * The year is written back per member before the message is sent, so a second run in the
 * same day greets nobody twice even though the greeting itself is one post.
 */
async function greetBirthdays(
  year: number,
  month: number,
  day: number,
): Promise<number> {
  const celebrating = await findMembersToGreet(month, day, year)
  if (celebrating.length === 0) return 0

  await postBirthdayToDiscord(celebrating.map(memberDisplayName))

  for (const member of celebrating) {
    await markBirthdayGreeted(member.id, year)
  }

  return celebrating.length
}

export async function GET(request: Request) {
  if (!isAuthorised(request)) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const now = new Date()
  const pending = await findUnsentRemindersForUpcomingEvents()

  // A daily job can only catch a window, so anything already past due is sent now
  // rather than skipped — better a late reminder than none.
  // A suggestion with no date yet has nothing to remind anyone about.
  const due = pending.filter(
    ({ event, offset }) =>
      event.startsAt !== null && reminderDueAt(event.startsAt, offset) <= now,
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

  // Today in Stockholm, not in UTC: at 06:00 UTC the two agree, but reading the date in
  // UTC would greet a day early for anyone whose birthday starts at midnight local.
  const today = new Date(
    now.toLocaleString("en-CA", { timeZone: DEFAULT_EVENT_TIME_ZONE }),
  )
  const greeted = await greetBirthdays(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  )

  // Last, so a failure here cannot cost anyone a reminder or a birthday greeting.
  const badges = await syncAutomaticBadgesForEveryone(now)

  // Said where someone will see it. A console line in a hosting provider's log is only
  // ever read by whoever already suspects something is wrong.
  if (badges.failed > 0) {
    await postCronFailureToDiscord({
      name: "badges",
      failed: badges.failed,
      of: badges.checked,
    })
  }

  return NextResponse.json({
    badges,
    checked: pending.length,
    due: due.length,
    sent: sent.length,
    greeted,
    events: sent,
  })
}
