import type { Metadata } from "next"
import { ArrowLeftIcon } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
        render={<Link href="/profile" transitionTypes={["nav-back"]} />}
        variant="ghost"
        size="sm"
        className="-ml-3"
      >
        <ArrowLeftIcon className="size-4" />
        {translateSettings("backToProfile")}
      </Button>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {translateSettings("title")}
      </h1>

      <div className="mt-8 flex items-center gap-4">
        <Avatar className="size-14">
          {member.avatarUrl ? (
            <AvatarImage src={member.avatarUrl} alt="" />
          ) : null}
          <AvatarFallback>
            {member.fullName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <p className="text-muted-foreground max-w-sm text-xs">
          {translateProfile("avatarFromGoogle")}
        </p>
      </div>

      <form action={updateMyProfile} className="mt-8 max-w-lg space-y-5">
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
    </PageContainer>
  )
}
