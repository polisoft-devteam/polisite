import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventCalendar } from "@/components/EventCalendar"
import {
  findEventCountsByMonth,
  findEventsInRange,
} from "@/features/events/queries"
import { findMembersWithBirthdays } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { addMonthsUtc, parseMonthParam } from "@/lib/calendar"
import { isActiveMember, visibleEventVisibilitiesFor } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/calendar">): Promise<Metadata> {
  const { locale } = await params
  const translateCalendar = await getTranslations({
    locale,
    namespace: "Calendar",
  })

  return { title: translateCalendar("title") }
}

export default async function CalendarPage({
  params,
  searchParams,
}: PageProps<"/[locale]/calendar">) {
  const { locale } = await params
  setRequestLocale(locale)

  const { month: monthParam } = await searchParams
  const month = parseMonthParam(
    typeof monthParam === "string" ? monthParam : undefined,
  )

  const viewer = await getViewer()

  // The grid shows some days either side of the month, so the query covers a month
  // on both sides rather than trying to match the visible range exactly.
  const allowedVisibilities = visibleEventVisibilitiesFor(viewer)

  const [events, monthCounts, birthdayMembers] = await Promise.all([
    findEventsInRange(
      allowedVisibilities,
      addMonthsUtc(month, -1),
      addMonthsUtc(month, 2),
    ),
    findEventCountsByMonth(allowedVisibilities, month.getUTCFullYear()),
    // Birthdays are members' own business, so a guest sees none of them.
    isActiveMember(viewer) ? findMembersWithBirthdays() : [],
  ])

  const birthdays = birthdayMembers.map((member) => ({
    id: member.id,
    name: member.nickname ?? member.fullName,
    avatarUrl: member.avatarUrl,
    birthday: member.birthday,
  }))

  return (
    // Wider than the standard page: a seven-column grid needs the room.
    <div className="mx-auto w-full max-w-7xl px-4 py-10">
      <EventCalendar
        month={month}
        events={events}
        birthdays={birthdays}
        monthCounts={monthCounts}
        locale={locale}
      />
    </div>
  )
}
