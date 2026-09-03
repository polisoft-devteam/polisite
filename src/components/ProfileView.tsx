// A member's profile. The same component whoever is looking and whoever is looked at: your
// own and everyone else's are this, so the two cannot drift into looking like different
// pages, which is what they had done.
//
// What differs is one slot. The page decides whether the reader may change anything and
// hands in the button, because who may edit is a permission question and this is a view.
//
// The header is deliberately not PageHeading: an avatar, a nickname and badges around the
// title is a composite specific to profiles, and folding it in would turn PageHeading
// into a kitchen sink. The h1 scale matches PageHeading so the two still agree.

import { getFormatter, getTranslations } from "next-intl/server"

import { EventList } from "@/components/EventList"
import { Fact, FactList } from "@/components/FactList"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Badge } from "@/components/ui/badge"
import type { Event, Member } from "@/db/schema"
import { ExternalLink } from "@/components/ExternalLink"
import { isMemberTitle } from "@/features/members/titles"
import { GithubIcon } from "@/lib/icons"

type ProfileViewProps = {
  member: Member
  upcomingEvents: Event[]
  pastEvents: Event[]
  locale: string
  /** Settings, edit, nothing at all. The page knows who may; this only makes room. */
  action?: React.ReactNode
  /** Rendered between the facts and the events, where the profile's own news belongs. */
  notifications?: React.ReactNode
}

export async function ProfileView({
  member,
  upcomingEvents,
  pastEvents,
  locale,
  action,
  notifications,
}: ProfileViewProps) {
  const translateProfile = await getTranslations("Profile")
  const translateMembers = await getTranslations("Members")
  const translateTitles = await getTranslations("Titles")
  const format = await getFormatter({ locale })

  return (
    <>
      <div className="flex items-center gap-4">
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

          {member.officialTitle && isMemberTitle(member.officialTitle) && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {translateTitles(member.officialTitle)}
              </Badge>
            </div>
          )}
        </div>

        {action}
      </div>

      <p className="mt-6 max-w-2xl text-sm">
        {member.bio ?? (
          <span className="text-muted-foreground">
            {translateProfile("noBio")}
          </span>
        )}
      </p>

      {member.githubUrl && (
        <div className="mt-4 text-sm">
          <ExternalLink href={member.githubUrl}>
            <GithubIcon className="size-3.5" />
            {translateMembers("github")}
          </ExternalLink>
        </div>
      )}

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

      {notifications}

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
