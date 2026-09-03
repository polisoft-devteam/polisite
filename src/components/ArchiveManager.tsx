// Adding to the archive, and taking back out what you put in.
//
// Members only, and checked here as well as by the caller: the form posts a URL that will
// be shown to every member, and the list names everything in the archive, which a guest
// must not receive.
//
// Removal sits in one list rather than as a button on every card. A delete button on a
// photo album you are only trying to open is a mistake waiting to happen, and threading
// one through four different card components would put it in four places at once.

import { getTranslations } from "next-intl/server"

import { AddArchiveLinkForm } from "@/components/AddArchiveLinkForm"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import type { ArchiveLink } from "@/db/schema"
import { removeArchiveLinkAction } from "@/features/archive/actions"
import { getViewer } from "@/lib/auth"
import { canAddArchiveLink, canRemoveArchiveLink } from "@/lib/permissions"
import { CloseIcon } from "@/lib/icons"

export async function ArchiveManager({ links }: { links: ArchiveLink[] }) {
  const viewer = await getViewer()
  if (!canAddArchiveLink(viewer)) return null

  const translateArchive = await getTranslations("Archive")

  return (
    <PageSection id="add" heading={translateArchive("addTitle")}>
      <AddArchiveLinkForm />

      {links.length > 0 && (
        <ItemList>
          {links.map((link) => (
            <li
              key={link.id}
              className="flex items-center justify-between gap-4 p-3"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {link.label}
                </span>
                <span className="text-muted-foreground block truncate text-xs">
                  {translateArchive(`kind_${link.kind}`)} · {link.url}
                </span>
              </span>

              {canRemoveArchiveLink(viewer, link) && (
                <form action={removeArchiveLinkAction} className="shrink-0">
                  <input type="hidden" name="archiveLinkId" value={link.id} />
                  <Button
                    type="submit"
                    variant="outline"
                    size="xs"
                    aria-label={translateArchive("remove")}
                  >
                    <CloseIcon className="size-3" />
                  </Button>
                </form>
              )}
            </li>
          ))}
        </ItemList>
      )}
    </PageSection>
  )
}
