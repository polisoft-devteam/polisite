// The archive's one form, for adding something and for correcting it afterwards.
//
// The kind is read off the URL rather than picked from a dropdown, because the URL already
// says what it is and asking again is asking the same question twice. What it worked out
// is shown as you type, so a mistyped link is obvious before it is submitted, and the
// button carries the same answer: a camera when there is something to add, a struck
// through circle when there is not.
//
// The server detects it again on submit. This one is a convenience and never a control.

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { FormField, FormSelect } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { detectArchiveLink } from "@/features/archive/detect"
import { AddToArchiveIcon, NotYetIcon } from "@/lib/icons"

export function ArchiveLinkForm({
  action,
  submitLabel,
  archiveLinkId,
  defaultLabel = "",
  defaultUrl = "",
  defaultAlbumGroup = "main",
}: {
  action: (formData: FormData) => void | Promise<void>
  submitLabel: string
  /** Set when correcting an entry rather than adding one. */
  archiveLinkId?: string
  defaultLabel?: string
  defaultUrl?: string
  defaultAlbumGroup?: string
}) {
  const translateArchive = useTranslations("Archive")
  const [url, setUrl] = useState(defaultUrl)

  const trimmed = url.trim()
  const detected = trimmed ? detectArchiveLink(trimmed) : null
  const canSubmit = detected !== null

  // Unique per form, so two of these on one page do not share a label's htmlFor.
  const idPrefix = archiveLinkId ?? "new"

  return (
    <form action={action} className="space-y-4">
      {archiveLinkId && (
        <input type="hidden" name="archiveLinkId" value={archiveLinkId} />
      )}

      <FormField
        label={translateArchive("addLabel")}
        htmlFor={`${idPrefix}-label`}
      >
        <Input
          id={`${idPrefix}-label`}
          name="label"
          required
          maxLength={120}
          defaultValue={defaultLabel}
        />
      </FormField>

      <FormField
        label={translateArchive("addUrl")}
        htmlFor={`${idPrefix}-url`}
        hint={
          trimmed === ""
            ? translateArchive("addUrlHint")
            : detected
              ? translateArchive("addDetected", {
                  kind: translateArchive(`kind_${detected.kind}`),
                })
              : translateArchive("addNotAUrl")
        }
      >
        <Input
          id={`${idPrefix}-url`}
          name="url"
          type="url"
          required
          placeholder="https://"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
        />
      </FormField>

      {/* Only an album is in one of two runs. Everything else has nowhere to put this. */}
      {detected?.kind === "album" && (
        <FormField
          label={translateArchive("addGroup")}
          htmlFor={`${idPrefix}-group`}
        >
          <FormSelect
            id={`${idPrefix}-group`}
            name="albumGroup"
            defaultValue={defaultAlbumGroup}
          >
            <option value="main">{translateArchive("albumsTitle")}</option>
            <option value="gaming">{translateArchive("gamingTitle")}</option>
          </FormSelect>
        </FormField>
      )}

      <Button type="submit" disabled={!canSubmit}>
        {canSubmit ? (
          <AddToArchiveIcon className="size-4" />
        ) : (
          <NotYetIcon className="size-4" />
        )}
        {submitLabel}
      </Button>
    </form>
  )
}
