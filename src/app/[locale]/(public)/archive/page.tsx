import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AlbumGrid } from "@/components/AlbumGrid"
import { PageSection } from "@/components/PageSection"
import { PlaylistEmbed } from "@/components/PlaylistEmbed"
import { AssociationLinks } from "@/components/AssociationLinks"
import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { VideoEmbed } from "@/components/VideoEmbed"
import { PHOTO_ALBUMS } from "@/lib/association-albums"
import { ASSOCIATION_PLAYLISTS } from "@/lib/association-playlists"
import { ASSOCIATION_FILMS } from "@/lib/association-media"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

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
  const viewer = await getViewer()

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
        <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {ASSOCIATION_FILMS.map((film) => (
            <VideoEmbed
              key={film.videoId}
              videoId={film.videoId}
              title={film.title}
              year={film.year}
              thumbnail={film.thumbnail}
              playLabel={translateArchive("play")}
            />
          ))}
        </div>
      )}

      {isActiveMember(viewer) && (
        <>
          <AlbumGrid
            heading={translateArchive("albumsTitle")}
            albums={PHOTO_ALBUMS.filter((album) => album.group === "main")}
            openLabel={translateArchive("openInGooglePhotos")}
          />
          <AlbumGrid
            heading={translateArchive("gamingTitle")}
            albums={PHOTO_ALBUMS.filter((album) => album.group === "gaming")}
            openLabel={translateArchive("openInGooglePhotos")}
          />
        </>
      )}

      {ASSOCIATION_PLAYLISTS.length > 0 && (
        <PageSection heading={translateArchive("musicTitle")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {ASSOCIATION_PLAYLISTS.map((playlist) => (
              <PlaylistEmbed key={playlist.playlistId} playlist={playlist} />
            ))}
          </div>
        </PageSection>
      )}

      {/* Shared albums and Drive folder are link-is-the-password, so members only. */}
      {isActiveMember(viewer) && <AssociationLinks />}
    </PageContainer>
  )
}
