import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/calendar">): Promise<Metadata> {
  const { locale } = await params
  const translateCalendar = await getTranslations({
    locale,
    namespace: "Calendar",
  })

  return { title: translateCalendar("title") }
}

export default async function CalendarPage({
  params,
}: PageProps<"/[locale]/calendar">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateCalendar = await getTranslations("Calendar")

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">
        {translateCalendar("title")}
      </h1>
      <p className="text-muted-foreground mt-4 rounded-lg border border-dashed p-6 text-sm">
        {translateCalendar("empty")}
      </p>
    </PageContainer>
  )
}
