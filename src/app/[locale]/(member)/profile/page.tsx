import type { Metadata } from "next"
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { Event } from "@/db/schema"
import {
  findPastEventsForMember,
  findUpcomingEventsForMember,
} from "@/features/events/queries"
import { updateMyProfile } from "@/features/members/actions"
import { getViewer } from "@/lib/auth"

export async function generateMetadata(): Promise<Metadata> {
  const translateProfile = await getTranslations("Profile")
  return { title: translateProfile("title") }
}

export default async function ProfilePage({
  params,
}: PageProps<"/[locale]/profile">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateProfile = await getTranslations("Profile")
  const viewer = await getViewer()

  // The (member) layout already redirected anyone without an active membership.
  const member = viewer!.member!

  const [upcomingEvents, pastEvents] = await Promise.all([
    findUpcomingEventsForMember(member.id),
    findPastEventsForMember(member.id),
  ])

  return (
    <PageContainer>
      <div className="flex items-center gap-4">
        <Avatar className="size-16">
          {member.avatarUrl ? (
            <AvatarImage src={member.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>
            {member.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {member.fullName}
          </h1>
          <p className="text-muted-foreground text-sm">{member.email}</p>
        </div>
      </div>

      <p className="text-muted-foreground mt-3 text-xs">
        {translateProfile("avatarFromGoogle")}
      </p>

      <form action={updateMyProfile} className="mt-10 max-w-lg space-y-5">
        <h2 className="text-lg font-medium">{translateProfile("editTitle")}</h2>

        <div className="space-y-2">
          <Label htmlFor="fullName">{translateProfile("fullName")}</Label>
          <Input
            id="fullName"
            name="fullName"
            defaultValue={member.fullName}
            required
            maxLength={120}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nickname">{translateProfile("nickname")}</Label>
          <Input
            id="nickname"
            name="nickname"
            defaultValue={member.nickname ?? ""}
            maxLength={60}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="officialTitle">
            {translateProfile("officialTitle")}
          </Label>
          <Input
            id="officialTitle"
            name="officialTitle"
            defaultValue={member.officialTitle ?? ""}
            maxLength={60}
            placeholder={translateProfile("officialTitlePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="funTitle">{translateProfile("funTitle")}</Label>
          <Input
            id="funTitle"
            name="funTitle"
            defaultValue={member.funTitle ?? ""}
            maxLength={60}
            placeholder={translateProfile("funTitlePlaceholder")}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bio">{translateProfile("bio")}</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={member.bio ?? ""}
            rows={4}
            maxLength={2000}
          />
        </div>

        <Button type="submit">{translateProfile("save")}</Button>
      </form>

      <EventList
        heading={translateProfile("upcomingTitle")}
        emptyText={translateProfile("upcomingEmpty")}
        events={upcomingEvents}
        locale={locale}
      />

      <EventList
        heading={translateProfile("attendedTitle")}
        emptyText={translateProfile("attendedEmpty")}
        events={pastEvents}
        locale={locale}
      />
    </PageContainer>
  )
}

async function EventList({
  heading,
  emptyText,
  events,
  locale,
}: {
  heading: string
  emptyText: string
  events: Event[]
  locale: string
}) {
  const format = await getFormatter({ locale })

  return (
    <section className="mt-12">
      <h2 className="text-lg font-medium">{heading}</h2>

      {events.length === 0 ? (
        <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
          {emptyText}
        </p>
      ) : (
        <ul className="mt-4 divide-y rounded-lg border">
          {events.map((event) => (
            <li key={event.id} className="flex justify-between gap-4 p-4">
              <span className="font-medium">{event.title}</span>
              <time
                dateTime={event.startsAt.toISOString()}
                className="text-muted-foreground text-sm"
              >
                {/* Stored UTC, shown in Stockholm time whatever the reader's device says. */}
                {format.dateTime(event.startsAt, {
                  dateStyle: "medium",
                  timeZone: "Europe/Stockholm",
                })}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
