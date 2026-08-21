import type { Metadata } from "next"
import { ArrowLeftIcon } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { FormField } from "@/components/FormField"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateMyProfile } from "@/features/members/actions"
import { Link } from "@/i18n/navigation"
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
      <Button
        nativeButton={false}
        render={<Link href="/profile" transitionTypes={["nav-back"]} />}
        variant="ghost"
        size="sm"
        className="-ml-3"
      >
        <ArrowLeftIcon className="size-4" />
        {translateSettings("backToProfile")}
      </Button>

      <div className="mt-4">
        <PageHeading title={translateSettings("title")} />
      </div>

      <div className="mt-8 flex items-center gap-4">
        <MemberAvatar
          fullName={member.fullName}
          avatarUrl={member.avatarUrl}
          className="size-14"
        />
        <p className="text-muted-foreground max-w-sm text-xs">
          {translateProfile("avatarFromGoogle")}
        </p>
      </div>

      <form action={updateMyProfile} className="mt-8 max-w-lg space-y-5">
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
