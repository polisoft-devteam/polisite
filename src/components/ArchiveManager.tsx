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

import { ArchiveLinkForm } from "@/components/ArchiveLinkForm"
import { Modal } from "@/components/Modal"
import { ItemList } from "@/components/ItemList"
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import type { ArchiveLink } from "@/db/schema"
import {
  addArchiveLinkAction,
  removeArchiveLinkAction,
  updateArchiveLinkAction,
} from "@/features/archive/actions"
import { getViewer } from "@/lib/auth"
import {
  canAddArchiveLink,
  canEditArchiveLink,
  canRemoveArchiveLink,
} from "@/lib/permissions"
import { CloseIcon, EditIcon } from "@/lib/icons"

export async function ArchiveManager({ links }: { links: ArchiveLink[] }) {
  const viewer = await getViewer()
  if (!canAddArchiveLink(viewer)) return null

  const translateArchive = await getTranslations("Archive")

  return (
    <PageSection id="add" heading={translateArchive("addTitle")}>
      <ArchiveLinkForm
        action={addArchiveLinkAction}
        submitLabel={translateArchive("addSubmit")}
      />

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

              <span className="flex shrink-0 items-center gap-1">
                {/* Correcting a mistyped link is the common case; the same people who may
                    do that may also take the entry away. */}
                {canEditArchiveLink(viewer, link) && (
                  <Modal
                    title={translateArchive("editTitle")}
                    closeLabel={translateArchive("membersOnlyClose")}
                    trigger={
                      <Button
                        variant="outline"
                        size="xs"
                        aria-label={translateArchive("edit")}
                      >
                        <EditIcon className="size-3" />
                      </Button>
                    }
                  >
                    <ArchiveLinkForm
                      action={updateArchiveLinkAction}
                      submitLabel={translateArchive("editSubmit")}
                      archiveLinkId={link.id}
                      defaultLabel={link.label}
                      defaultUrl={link.url}
                      defaultAlbumGroup={link.albumGroup ?? "main"}
                    />
                  </Modal>
                )}

                {canRemoveArchiveLink(viewer, link) && (
                  <form action={removeArchiveLinkAction}>
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
              </span>
            </li>
          ))}
        </ItemList>
      )}
    </PageSection>
  )
}
