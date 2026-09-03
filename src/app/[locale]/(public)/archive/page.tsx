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
import { ArchiveManager } from "@/components/ArchiveManager"
import { ExternalLink } from "@/components/ExternalLink"
import { ItemList } from "@/components/ItemList"
import { findArchiveLinks } from "@/features/archive/queries"
import { toFilm, toPhotoAlbum, toPlaylist } from "@/features/archive/view"
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

  // Everything the archive holds, in one query. Members only past this point: an album
  // shared "anyone with the link" has its URL as its permission.
  const archive = await findArchiveLinks()

  const films = archive.film.map(toFilm)
  const mainAlbums = archive.album
    .filter((link) => link.albumGroup !== "gaming")
    .map(toPhotoAlbum)
  const gamingAlbums = archive.album
    .filter((link) => link.albumGroup === "gaming")
    .map(toPhotoAlbum)
  const playlists = archive.playlist.map(toPlaylist)
  const resources = archive.resource

  // Only the sections that actually have something in them, so the navigation never
  // points at a heading that was not rendered.
  const sections: SubNavItem[] = [
    ...(films.length > 0
      ? [{ id: "films", label: translateArchive("filmsTitle") }]
      : []),
    { id: "albums", label: translateArchive("albumsTitle") },
    { id: "gaming", label: translateArchive("gamingTitle") },
    ...(playlists.length > 0
      ? [{ id: "music", label: translateArchive("musicTitle") }]
      : []),
    ...(isMember && resources.length > 0
      ? [{ id: "resources", label: translateArchive("resourcesTitle") }]
      : []),
  ]

  return (
    <>
      {/* Full bleed like the front page's, so the archive opens on a photograph rather
          than a heading. Falls back to the plain heading if the folder is empty. */}
      {archiveImages.length > 0 ? (
        <PhotoHero
          images={archiveImages}
          // A portrait photo, with its subject below centre but not at the very foot.
          focalPoint="lower"
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

        {films.length === 0 ? (
          <div className="mt-8">
            <EmptyState>{translateArchive("empty")}</EmptyState>
          </div>
        ) : (
          <PageSection id="films" heading={translateArchive("filmsTitle")}>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {films.map((film) =>
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
              albums={mainAlbums}
              openLabel={translateArchive("openInGooglePhotos")}
              canOpen={isMember}
            />
            <AlbumGrid
              id="gaming"
              heading={translateArchive("gamingTitle")}
              albums={gamingAlbums}
              openLabel={translateArchive("openInGooglePhotos")}
              canOpen={isMember}
            />
          </>
        }

        {playlists.length > 0 && (
          <PageSection id="music" heading={translateArchive("musicTitle")}>
            <div className="grid gap-4 sm:grid-cols-2">
              {playlists.map((playlist) => (
                <PlaylistEmbed key={playlist.playlistId} playlist={playlist} />
              ))}
            </div>
          </PageSection>
        )}

        {/* Members only, and each entry is a link somebody chose to share with the club. */}
        {isMember && resources.length > 0 && (
          <PageSection
            id="resources"
            heading={translateArchive("resourcesTitle")}
          >
            <ItemList>
              {resources.map((resource) => (
                <li key={resource.id} className="p-3">
                  <ExternalLink href={resource.url}>
                    {resource.label}
                  </ExternalLink>
                </li>
              ))}
            </ItemList>
          </PageSection>
        )}

        {/* Shared albums and Drive folder are link-is-the-password, so members only. */}
        {isActiveMember(viewer) && <AssociationLinks />}

        <ArchiveManager
          links={[
            ...archive.album,
            ...archive.film,
            ...archive.playlist,
            ...archive.resource,
          ]}
        />
      </PageContainer>
    </>
  )
}
