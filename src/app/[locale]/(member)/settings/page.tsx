import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { ProfileFields } from "@/components/ProfileFields"
import { Badge } from "@/components/ui/badge"
import { MEMBER_TITLES, isMemberTitle } from "@/features/members/titles"
import { BackLink } from "@/components/BackLink"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Button } from "@/components/ui/button"
import { updateMyProfile } from "@/features/members/actions"
import { getViewer } from "@/lib/auth"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/settings">): Promise<Metadata> {
  const { locale } = await params
  const translateSettings = await getTranslations({
    locale,
    namespace: "Settings",
  })

  return { title: translateSettings("title") }
}

export default async function SettingsPage({
  params,
}: PageProps<"/[locale]/settings">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateProfile = await getTranslations("Profile")
  const translateTitles = await getTranslations("Titles")
  const translateSettings = await getTranslations("Settings")

  const viewer = await getViewer()

  // The (member) layout already redirected anyone without an active membership.
  const member = viewer!.member!

  return (
    <PageContainer>
      <BackLink href="/profile">{translateSettings("backToProfile")}</BackLink>

      <div className="mt-4">
        <PageHeading title={translateSettings("title")} />
      </div>

      <form action={updateMyProfile} className="mt-8 max-w-lg space-y-6">
        <ProfileFields member={member} />

        {/* Read-only rather than a control: an office is handed out by an admin, and a
            disabled dropdown cannot even be opened to see the list. */}
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {translateProfile("officialTitle")}
          </p>

          {member.officialTitle && isMemberTitle(member.officialTitle) ? (
            <Badge variant="secondary">
              {translateTitles(member.officialTitle)}
            </Badge>
          ) : (
            <p className="text-muted-foreground text-sm">
              {translateProfile("officialTitleNone")}
            </p>
          )}

          <details className="text-muted-foreground text-xs">
            <summary className="cursor-pointer">
              {translateProfile("officialTitleSeeAll")}
            </summary>
            <ul className="mt-2 list-inside list-disc space-y-1">
              {MEMBER_TITLES.map((title) => (
                <li key={title}>{translateTitles(title)}</li>
              ))}
            </ul>
          </details>

          <p className="text-muted-foreground text-xs">
            {translateProfile("officialTitleHint")}
          </p>
        </div>

        <Button type="submit" size="lg">
          {translateProfile("save")}
        </Button>
      </form>
    </PageContainer>
  )
}
