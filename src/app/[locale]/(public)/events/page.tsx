import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events">): Promise<Metadata> {
  const { locale } = await params
  const translateEvents = await getTranslations({ locale, namespace: "Events" })

  return { title: translateEvents("title") }
}

export default async function EventsPage({
  params,
}: PageProps<"/[locale]/events">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">
        {translateEvents("title")}
      </h1>
      <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
        {translateEvents("comingSoon")}
      </p>
    </PageContainer>
  )
}
