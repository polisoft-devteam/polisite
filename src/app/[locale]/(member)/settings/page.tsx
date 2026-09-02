import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { FormField, FormSelect } from "@/components/FormField"
import { MEMBER_TITLES } from "@/features/members/titles"
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

        {/* Disabled rather than absent: an office is handed out by an admin, and seeing
            the list of them is half the point of having them. A disabled control also
            posts nothing, so the action cannot be tricked into setting one. */}
        <FormField
          label={translateProfile("officialTitle")}
          htmlFor="officialTitle"
          hint={translateProfile("officialTitleHint")}
        >
          <FormSelect
            id="officialTitle"
            disabled
            defaultValue={member.officialTitle ?? ""}
          >
            <option value="">{translateProfile("officialTitleNone")}</option>
            {MEMBER_TITLES.map((title) => (
              <option key={title} value={title}>
                {translateTitles(title)}
              </option>
            ))}
          </FormSelect>
        </FormField>

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
