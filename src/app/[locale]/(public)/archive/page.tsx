import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { AlbumGrid } from "@/components/AlbumGrid"
import { LockedMediaCard } from "@/components/LockedMediaCard"
import { PageHeading } from "@/components/PageHeading"
import { PageSection } from "@/components/PageSection"
import { PhotoHero } from "@/components/PhotoHero"
import { PageSubNav, type SubNavItem } from "@/components/PageSubNav"
import { PlaylistEmbed } from "@/components/PlaylistEmbed"
import { AssociationLinks } from "@/components/AssociationLinks"
import { EmptyState } from "@/components/EmptyState"
import { PageContainer } from "@/components/PageContainer"
import { VideoEmbed } from "@/components/VideoEmbed"
import { PHOTO_ALBUMS } from "@/lib/association-albums"
import { ASSOCIATION_PLAYLISTS } from "@/lib/association-playlists"
import { ASSOCIATION_FILMS } from "@/lib/association-media"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"
import { readArchiveImages } from "@/lib/site-images"

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
  const isMember = isActiveMember(viewer)
  const archiveImages = await readArchiveImages()

  // Only the sections that actually have something in them, so the navigation never
  // points at a heading that was not rendered.
  const sections: SubNavItem[] = [
    ...(ASSOCIATION_FILMS.length > 0
      ? [{ id: "films", label: translateArchive("filmsTitle") }]
      : []),
    { id: "albums", label: translateArchive("albumsTitle") },
    { id: "gaming", label: translateArchive("gamingTitle") },
    ...(ASSOCIATION_PLAYLISTS.length > 0
      ? [{ id: "music", label: translateArchive("musicTitle") }]
      : []),
  ]

  return (
    <>
      {/* Full bleed like the front page's, so the archive opens on a photograph rather
          than a heading. Falls back to the plain heading if the folder is empty. */}
      {archiveImages.length > 0 ? (
        <PhotoHero
          images={archiveImages}
          title={translateArchive("title")}
          tagline={translateArchive("intro")}
        />
      ) : null}

      <PageContainer belowHero>
        {archiveImages.length === 0 && (
          <>
            <PageHeading title={translateArchive("title")} />
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {translateArchive("intro")}
            </p>
          </>
        )}

        <PageSubNav items={sections} />

        {ASSOCIATION_FILMS.length === 0 ? (
          <div className="mt-8">
            <EmptyState>{translateArchive("empty")}</EmptyState>
          </div>
        ) : (
          <PageSection id="films" heading={translateArchive("filmsTitle")}>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ASSOCIATION_FILMS.map((film) =>
                isMember ? (
                  <VideoEmbed
                    key={film.title}
                    videoId={film.videoId}
                    title={film.title}
                    year={film.year}
                    thumbnail={film.thumbnail}
                    playLabel={translateArchive("play")}
                  />
                ) : (
                  <LockedMediaCard
                    key={film.title}
                    label={film.title}
                    coverUrl={film.thumbnail}
                    caption={film.year}
                  />
                ),
              )}
            </div>
          </PageSection>
        )}

        {
          <>
            <AlbumGrid
              id="albums"
              heading={translateArchive("albumsTitle")}
              albums={PHOTO_ALBUMS.filter((album) => album.group === "main")}
              openLabel={translateArchive("openInGooglePhotos")}
              canOpen={isMember}
            />
            <AlbumGrid
              id="gaming"
              heading={translateArchive("gamingTitle")}
              albums={PHOTO_ALBUMS.filter((album) => album.group === "gaming")}
              openLabel={translateArchive("openInGooglePhotos")}
              canOpen={isMember}
            />
          </>
        }

        {ASSOCIATION_PLAYLISTS.length > 0 && (
          <PageSection id="music" heading={translateArchive("musicTitle")}>
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
    </>
  )
}
