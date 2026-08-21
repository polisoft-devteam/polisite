import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { FormField } from "@/components/FormField"
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
            className="size-14"
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

        <FormField
          label={translateProfile("officialTitle")}
          htmlFor="officialTitle"
        >
          <Input
            id="officialTitle"
            name="officialTitle"
            defaultValue={member.officialTitle ?? ""}
            maxLength={60}
            placeholder={translateProfile("officialTitlePlaceholder")}
          />
        </FormField>

        <FormField label={translateProfile("funTitle")} htmlFor="funTitle">
          <Input
            id="funTitle"
            name="funTitle"
            defaultValue={member.funTitle ?? ""}
            maxLength={60}
            placeholder={translateProfile("funTitlePlaceholder")}
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
