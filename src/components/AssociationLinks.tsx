// Where the association keeps things that aren't in this app: Discord, the shared photo
// albums, the Drive folder, the repository.
//
// Only rendered for active members. The albums and folder are shared "anyone with the
// link", so the URL is the permission — a guest must never receive one, which is why this
// is decided before rendering rather than hidden with CSS.

import { getTranslations } from "next-intl/server"

import { ExternalLink } from "@/components/ExternalLink"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import { SectionHeading } from "@/components/SectionHeading"
import { getAssociationLinks, getPhotoAlbums } from "@/lib/association-links"
import {
  DiscordIcon,
  DriveIcon,
  GithubIcon,
  PhotosIcon,
  type IconComponent,
} from "@/lib/icons"

const LINK_ICON: Record<string, IconComponent> = {
  discord: DiscordIcon,
  drive: DriveIcon,
  github: GithubIcon,
}

export async function AssociationLinks() {
  const translateLinks = await getTranslations("Links")
  const links = getAssociationLinks()
  const albums = getPhotoAlbums()

  if (links.length === 0 && albums.length === 0) return null

  return (
    <PageSection heading={translateLinks("title")}>
      <p className="text-muted-foreground max-w-2xl text-sm">
        {translateLinks("membersOnlyNote")}
      </p>

      {links.length > 0 && (
        <ItemList>
          {links.map((link) => {
            const Icon = LINK_ICON[link.id]

            return (
              <li key={link.id} className="p-3">
                <ExternalLink
                  href={link.url}
                  className="flex items-center gap-3"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block font-medium">
                      {translateLinks(`${link.id}.label`)}
                    </span>
                    <span className="text-muted-foreground block text-sm">
                      {translateLinks(`${link.id}.description`)}
                    </span>
                  </span>
                </ExternalLink>
              </li>
            )
          })}
        </ItemList>
      )}

      {albums.length > 0 && (
        <>
          <SectionHeading>
            <span className="flex items-center gap-2">
              <PhotosIcon className="size-5 shrink-0" />
              {translateLinks("photos.label")}
            </span>
          </SectionHeading>

          <p className="text-muted-foreground text-sm">
            {translateLinks("photos.description")}
          </p>

          {/* A grid rather than a list: eighteen stacked rows is a scroll, not a menu. */}
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((album) => (
              <li key={album.url}>
                <ExternalLink
                  href={album.url}
                  className="border-border hover:bg-muted flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
                >
                  <span className="truncate">{album.label}</span>
                </ExternalLink>
              </li>
            ))}
          </ul>
        </>
      )}
    </PageSection>
  )
}
