// Read-only profile. The same layout is used for your own profile and anyone else's —
// only the settings link differs.
//
// The header is deliberately not PageHeading: an avatar, a nickname and badges around the
// title is a composite specific to profiles, and folding it in would turn PageHeading
// into a kitchen sink. The h1 scale matches PageHeading so the two still agree.

import { getFormatter, getTranslations } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { Fact, FactList } from "@/components/FactList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Event, Member } from "@/db/schema"
import { Link } from "@/i18n/navigation"
import { SettingsIcon } from "@/lib/icons"

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
          <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance">
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

      <div className="mt-6">
        <FactList>
          {member.joinedAssociationAt && (
            <Fact label={translateProfile("joinedAssociationAt")}>
              {format.dateTime(member.joinedAssociationAt, {
                dateStyle: "long",
              })}
            </Fact>
          )}
          {member.birthday && (
            <Fact label={translateProfile("birthday")}>{member.birthday}</Fact>
          )}
        </FactList>
      </div>

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
    </>
  )
}
