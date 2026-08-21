import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventForm } from "@/components/EventForm"
import { BackLink } from "@/components/BackLink"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { createEventAction } from "@/features/events/actions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/events/new">): Promise<Metadata> {
  const { locale } = await params
  const translateEvents = await getTranslations({
    locale,
    namespace: "Events",
  })

  return { title: translateEvents("createTitle") }
}

export default async function NewEventPage({
  params,
}: PageProps<"/[locale]/events/new">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateEvents = await getTranslations("Events")

  return (
    <PageContainer>
      <BackLink href="/events">{translateEvents("back")}</BackLink>

      <div className="mt-4">
        <PageHeading title={translateEvents("createTitle")} />
      </div>

      <EventForm
        action={createEventAction}
        submitLabel={translateEvents("create")}
      />
    </PageContainer>
  )
}
