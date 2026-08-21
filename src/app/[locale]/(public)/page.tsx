import { getTranslations, setRequestLocale } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateHome = await getTranslations("Home")

  return (
    <PageContainer>
      <PageHeading title={translateHome("title")} />
      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateHome("intro")}
      </p>

      <PageSection heading={translateHome("upcomingTitle")}>
        <EmptyState>{translateHome("upcomingEmpty")}</EmptyState>
      </PageSection>
    </PageContainer>
  )
}
