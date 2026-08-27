import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AssociationTimeline } from "@/components/AssociationTimeline"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { VideoEmbed } from "@/components/VideoEmbed"
import { ASSOCIATION_NAME } from "@/lib/association"
import { ASSOCIATION_FILMS } from "@/lib/association-media"

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
        {translateAbout("intro", { associationName: ASSOCIATION_NAME })}
      </p>

      <PageSection heading={translateAbout("timelineHeading")}>
        <AssociationTimeline />
      </PageSection>

      {ASSOCIATION_FILMS.length > 0 && (
        <PageSection heading={translateAbout("filmsTitle")}>
          <div className="grid max-w-2xl gap-8">
            {ASSOCIATION_FILMS.map((film) => (
              <VideoEmbed
                key={film.videoId}
                videoId={film.videoId}
                title={film.title}
                playLabel={translateAbout("filmPlay")}
                privacyNote={translateAbout("filmPrivacyNote")}
              />
            ))}
          </div>
        </PageSection>
      )}

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
