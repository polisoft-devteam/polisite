// Read-only profile. The same layout is used for your own profile and anyone else's —
// only the settings link differs.

import { SettingsIcon } from "lucide-react"
import { getFormatter, getTranslations } from "next-intl/server"

import { MemberAvatar } from "@/components/MemberAvatar"
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
          <h1 className="text-2xl font-semibold tracking-tight">
            {member.fullName}
          </h1>

          {member.nickname && (
            <p className="text-muted-foreground text-sm">
              &ldquo;{member.nickname}&rdquo;
            </p>
          )}

          <div className="mt-2 flex flex-wrap gap-2">
            {member.officialTitle && (
              <ProfileBadge>{member.officialTitle}</ProfileBadge>
            )}
            {member.funTitle && <ProfileBadge>{member.funTitle}</ProfileBadge>}
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

function ProfileBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-xs">
      {children}
    </span>
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
