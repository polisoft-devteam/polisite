import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { VideoEmbed } from "@/components/VideoEmbed"
import { ASSOCIATION_FILMS } from "@/lib/association-media"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/archive">): Promise<Metadata> {
  const { locale } = await params
  const translateArchive = await getTranslations({
    locale,
    namespace: "Archive",
  })

  return { title: translateArchive("title") }
}

export default async function ArchivePage({
  params,
}: PageProps<"/[locale]/archive">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateArchive = await getTranslations("Archive")

  return (
    <PageContainer>
      <PageHeading title={translateArchive("title")} />
      <p className="text-muted-foreground mt-4 max-w-2xl">
        {translateArchive("intro")}
      </p>

      {ASSOCIATION_FILMS.length === 0 ? (
        <div className="mt-8">
          <EmptyState>{translateArchive("empty")}</EmptyState>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {ASSOCIATION_FILMS.map((film) => (
            <VideoEmbed
              key={film.videoId}
              videoId={film.videoId}
              title={film.title}
              year={film.year}
              playLabel={translateArchive("play")}
            />
          ))}
        </div>
      )}
    </PageContainer>
  )
}
