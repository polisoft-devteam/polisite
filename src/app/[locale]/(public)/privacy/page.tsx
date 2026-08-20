import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { PageContainer } from "@/components/PageContainer"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy">): Promise<Metadata> {
  const { locale } = await params
  const translatePrivacy = await getTranslations({
    locale,
    namespace: "Privacy",
  })

  return { title: translatePrivacy("title") }
}

export default async function PrivacyPage({
  params,
}: PageProps<"/[locale]/privacy">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translatePrivacy = await getTranslations("Privacy")

  const storedDataItems = translatePrivacy.raw("dataItems") as string[]
  const rightsItems = translatePrivacy.raw("rightsItems") as string[]

  return (
    <PageContainer>
      <h1 className="text-3xl font-semibold tracking-tight">
        {translatePrivacy("title")}
      </h1>
      <p className="text-muted-foreground mt-2 text-sm">
        {translatePrivacy("lastUpdated")}
      </p>

      <div className="mt-10 max-w-2xl space-y-8">
        <PolicySection heading={translatePrivacy("controllerTitle")}>
          <p>{translatePrivacy("controllerBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("dataTitle")}>
          <ul className="list-disc space-y-1 pl-5">
            {storedDataItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>{translatePrivacy("dataNote")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("whyTitle")}>
          <p>{translatePrivacy("whyBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("whoTitle")}>
          <p>{translatePrivacy("whoBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("whereTitle")}>
          <p>{translatePrivacy("whereBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("retentionTitle")}>
          <p>{translatePrivacy("retentionBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("rightsTitle")}>
          <ul className="list-disc space-y-1 pl-5">
            {rightsItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </PolicySection>

        <PolicySection heading={translatePrivacy("cookiesTitle")}>
          <p>{translatePrivacy("cookiesBody")}</p>
        </PolicySection>

        <PolicySection heading={translatePrivacy("contactTitle")}>
          <p>{translatePrivacy("contactBody")}</p>
        </PolicySection>
      </div>
    </PageContainer>
  )
}

function PolicySection({
  heading,
  children,
}: {
  heading: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2 className="text-lg font-medium">{heading}</h2>
      <div className="text-muted-foreground mt-3 space-y-3 text-sm">
        {children}
      </div>
    </section>
  )
}
