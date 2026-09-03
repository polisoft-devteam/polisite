// Every badge there is, in colour, whether or not the reader has it.
//
// A reference rather than a scoreboard: it says what exists and how each one arrives, so
// the greyed-out shelf on a profile has somewhere to point.

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BackLink } from "@/components/BackLink"
import { BadgeShelf } from "@/components/BadgeShelf"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { BADGES } from "@/features/members/badges"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/badges">): Promise<Metadata> {
  const { locale } = await params
  const translateBadges = await getTranslations({ locale, namespace: "Badges" })

  return { title: translateBadges("allTitle") }
}

export default async function BadgesPage({
  params,
}: PageProps<"/[locale]/badges">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateBadges = await getTranslations("Badges")

  return (
    <PageContainer>
      <BackLink href="/profile">{translateBadges("backToProfile")}</BackLink>

      <div className="mt-4">
        <PageHeading title={translateBadges("allTitle")} />
      </div>

      <p className="text-muted-foreground mt-6 max-w-prose text-sm">
        {translateBadges("intro")}
      </p>

      <div className="mt-8">
        <BadgeShelf locale={locale} mode="catalogue" />
      </div>

      {/* The shelf has room for a name and nothing else, so the how of each one is spelled
          out here rather than left to a tooltip. */}
      <dl className="mt-10 max-w-prose space-y-4 text-sm">
        {BADGES.map((badge) => (
          <div key={badge.key}>
            <dt className="font-medium">
              {translateBadges(`${badge.key}.title`)}
            </dt>
            <dd className="text-muted-foreground">
              {translateBadges(`${badge.key}.description`)}
            </dd>
          </div>
        ))}
      </dl>
    </PageContainer>
  )
}
