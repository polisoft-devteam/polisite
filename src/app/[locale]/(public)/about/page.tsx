import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AssociationTimeline } from "@/components/AssociationTimeline"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { ASSOCIATION_FULL_NAME, ASSOCIATION_NAME } from "@/lib/association"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params
  const translateAbout = await getTranslations({ locale, namespace: "About" })

  return { title: translateAbout("title") }
}

export default async function AboutPage({
  params,
}: PageProps<"/[locale]/about">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateAbout = await getTranslations("About")

  return (
    <PageContainer>
      <PageHeading title={ASSOCIATION_FULL_NAME} />

      <p className="mt-4 max-w-2xl font-medium">{translateAbout("motto")}</p>

      {/* The association's own history, in the order it happened. Named keys rather than
          an array, so a paragraph can be reworded without renumbering the rest. */}
      <div className="text-muted-foreground mt-6 max-w-2xl space-y-4">
        <p>{translateAbout("origin")}</p>
        <p>{translateAbout("growth")}</p>
        <p>{translateAbout("arrivals")}</p>
        <p>{translateAbout("guests")}</p>
        <p>{translateAbout("bond")}</p>
      </div>

      <PageSection heading={translateAbout("timelineHeading")}>
        <AssociationTimeline />
      </PageSection>

      <PageSection heading={translateAbout("membershipTitle")}>
        <p className="text-muted-foreground max-w-2xl">
          {translateAbout("membershipBody", {
            associationName: ASSOCIATION_NAME,
          })}
        </p>
      </PageSection>
    </PageContainer>
  )
}
