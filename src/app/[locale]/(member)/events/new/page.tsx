import type { Metadata } from "next"
import { ArrowLeftIcon } from "lucide-react"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EventForm } from "@/components/EventForm"
import { PageContainer } from "@/components/PageContainer"
import { Button } from "@/components/ui/button"
import { createEventAction } from "@/features/events/actions"
import { Link } from "@/i18n/navigation"

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
      <Button
        nativeButton={false}
        render={<Link href="/events" transitionTypes={["nav-back"]} />}
        variant="ghost"
        size="sm"
        className="-ml-3"
      >
        <ArrowLeftIcon className="size-4" />
        {translateEvents("back")}
      </Button>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight">
        {translateEvents("createTitle")}
      </h1>

      <EventForm
        action={createEventAction}
        submitLabel={translateEvents("create")}
      />
    </PageContainer>
  )
}
