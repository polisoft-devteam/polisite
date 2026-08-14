import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateHome = await getTranslations("Home")

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">
        {translateHome("title")}
      </h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateHome("intro")}
      </p>

      <section className="mt-12">
        <h2 className="text-xl font-medium">
          {translateHome("upcomingTitle")}
        </h2>
        <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
          {translateHome("upcomingEmpty")}
        </p>
      </section>
    </PageContainer>
  )
}
