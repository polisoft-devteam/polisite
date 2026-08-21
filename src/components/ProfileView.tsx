// Read-only profile. The same layout is used for your own profile and anyone else's —
// only the settings link differs.

import { SettingsIcon } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { ItemList } from "@/components/ItemList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { SectionHeading } from "@/components/SectionHeading"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event, Member } from "@/db/schema"
import { Link } from "@/i18n/navigation"

type ProfileViewProps = {
  member: Member
  upcomingEvents: Event[]
  pastEvents: Event[]
  isOwnProfile: boolean
  locale: string
}

export async function ProfileView({
  member,
  upcomingEvents,
  pastEvents,
  isOwnProfile,
  locale,
}: ProfileViewProps) {
  const translateProfile = await getTranslations("Profile")
  const format = await getFormatter({ locale })

  return (
    <>
      <div className="flex items-start gap-4">
        <MemberAvatar
          fullName={member.fullName}
          avatarUrl={member.avatarUrl}
          className="size-16 text-base"
        />

        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {member.fullName}
          </h1>

          {member.nickname && (
            <p className="text-muted-foreground text-sm">
              &ldquo;{member.nickname}&rdquo;
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {member.officialTitle && (
              <Badge variant="secondary">{member.officialTitle}</Badge>
            )}
            {member.funTitle && (
              <Badge variant="outline">{member.funTitle}</Badge>
            )}
          </div>
        </div>

        {isOwnProfile && (
          <Button
            nativeButton={false}
            render={<Link href="/settings" transitionTypes={["nav-forward"]} />}
            variant="ghost"
            size="sm"
            aria-label={translateProfile("settings")}
          >
            <SettingsIcon className="size-4" />
            <span className="hidden sm:inline">
              {translateProfile("settings")}
            </span>
          </Button>
        )}
      </div>

      <p className="mt-6 max-w-2xl text-sm">
        {member.bio ?? (
          <span className="text-muted-foreground">
            {translateProfile("noBio")}
          </span>
        )}
      </p>

      <dl className="text-muted-foreground mt-6 space-y-1 text-sm">
        {member.joinedAssociationAt && (
          <ProfileFact label={translateProfile("joinedAssociationAt")}>
            {format.dateTime(member.joinedAssociationAt, { dateStyle: "long" })}
          </ProfileFact>
        )}
        {member.birthday && (
          <ProfileFact label={translateProfile("birthday")}>
            {member.birthday}
          </ProfileFact>
        )}
      </dl>

      <ProfileEventList
        heading={translateProfile("upcomingTitle")}
        emptyText={translateProfile("upcomingEmpty")}
        events={upcomingEvents}
        locale={locale}
      />

      <ProfileEventList
        heading={translateProfile("attendedTitle")}
        emptyText={translateProfile("attendedEmpty")}
        events={pastEvents}
        locale={locale}
      />
    </>
  )
}

function ProfileFact({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-2">
      <dt>{label}:</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  )
}

async function ProfileEventList({
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
      <SectionHeading>{heading}</SectionHeading>

      {events.length === 0 ? (
        <div className="mt-4">
          <EmptyState>{emptyText}</EmptyState>
        </div>
      ) : (
        <div className="mt-4">
          <ItemList>
            {events.map((event) => (
              <li key={event.id} className="flex justify-between gap-4 p-4">
                <span className="font-medium">{event.title}</span>
                <time
                  dateTime={event.startsAt.toISOString()}
                  className="text-muted-foreground text-sm"
                >
                  {format.dateTime(event.startsAt, {
                    dateStyle: "medium",
                    timeZone: "Europe/Stockholm",
                  })}
                </time>
              </li>
            ))}
          </ItemList>
        </div>
      )}
    </section>
  )
}
