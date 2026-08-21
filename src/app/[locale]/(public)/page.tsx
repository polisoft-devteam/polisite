import { getTranslations, setRequestLocale } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { SectionHeading } from "@/components/SectionHeading"

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

      <section className="mt-12">
        <SectionHeading>{translateHome("upcomingTitle")}</SectionHeading>
        <div className="mt-4">
          <EmptyState>{translateHome("upcomingEmpty")}</EmptyState>
        </div>
      </section>
    </PageContainer>
  )
}
