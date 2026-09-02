import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { FormField } from "@/components/FormField"
import { Badge } from "@/components/ui/badge"
import { MEMBER_TITLES, isMemberTitle } from "@/features/members/titles"
import { BackLink } from "@/components/BackLink"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
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
        <div className="flex items-center gap-4">
          <MemberAvatar
            fullName={member.fullName}
            avatarUrl={member.avatarUrl}
            className="size-24 text-2xl"
          />
          <FormField
            label={translateProfile("avatar")}
            htmlFor="avatar"
            hint={translateProfile("avatarHint")}
          >
            <Input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="cursor-pointer"
            />
          </FormField>
        </div>
        <FormField label={translateProfile("fullName")} htmlFor="fullName">
          <Input
            id="fullName"
            name="fullName"
            defaultValue={member.fullName}
            required
            maxLength={120}
          />
        </FormField>

        <FormField label={translateProfile("nickname")} htmlFor="nickname">
          <Input
            id="nickname"
            name="nickname"
            defaultValue={member.nickname ?? ""}
            maxLength={60}
          />
        </FormField>

        {/* Read-only rather than a disabled dropdown: a disabled select cannot be
            opened at all, so the list it was meant to show was unreachable. The offices
            are listed in a disclosure instead, which opens without being a control. */}
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

        <FormField
          label={translateProfile("githubUrl")}
          htmlFor="githubUrl"
          hint={translateProfile("githubUrlHint")}
        >
          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            placeholder="https://github.com/"
            defaultValue={member.githubUrl ?? ""}
            maxLength={300}
          />
        </FormField>

        <FormField label={translateProfile("bio")} htmlFor="bio">
          <Textarea
            id="bio"
            name="bio"
            defaultValue={member.bio ?? ""}
            rows={4}
            maxLength={2000}
          />
        </FormField>

        <Button type="submit" size="lg">
          {translateProfile("save")}
        </Button>
      </form>
    </PageContainer>
  )
}
