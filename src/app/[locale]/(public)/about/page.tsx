import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { SectionHeading } from "@/components/SectionHeading"

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
      <PageHeading title={translateAbout("title")} />
      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateAbout("intro")}
      </p>

      <section className="mt-12">
        <SectionHeading>{translateAbout("membershipTitle")}</SectionHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          {translateAbout("membershipBody")}
        </p>
      </section>
    </PageContainer>
  )
}
