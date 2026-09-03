// Adding something to the archive: a name and a link, and nothing else to decide.
//
// The kind is read off the URL rather than picked from a dropdown, because the URL already
// says what it is and asking again is asking the same question twice. What it worked out
// is shown as you type, so a mistyped link is obvious before it is submitted.
//
// The server detects it again on submit. This one is a convenience and never a control.

"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"

import { FormField, FormSelect } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addArchiveLinkAction } from "@/features/archive/actions"
import { detectArchiveLink } from "@/features/archive/detect"
import { AddToArchiveIcon, NotYetIcon } from "@/lib/icons"

export function AddArchiveLinkForm() {
  const translateArchive = useTranslations("Archive")
  const [url, setUrl] = useState("")

  const trimmed = url.trim()
  const detected = trimmed ? detectArchiveLink(trimmed) : null
  const canSubmit = detected !== null

  return (
    <form action={addArchiveLinkAction} className="mt-4 max-w-xl space-y-4">
      <FormField label={translateArchive("addLabel")} htmlFor="archive-label">
        <Input id="archive-label" name="label" required maxLength={120} />
      </FormField>

      <FormField
        label={translateArchive("addUrl")}
        htmlFor="archive-url"
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
          id="archive-url"
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
        <FormField label={translateArchive("addGroup")} htmlFor="archive-group">
          <FormSelect id="archive-group" name="albumGroup" defaultValue="main">
            <option value="main">{translateArchive("albumsTitle")}</option>
            <option value="gaming">{translateArchive("gamingTitle")}</option>
          </FormSelect>
        </FormField>
      )}

      {/* The icon carries the same answer as the disabled state, so the button says why
          it cannot be pressed rather than only that it cannot. */}
      <Button type="submit" disabled={!canSubmit}>
        {canSubmit ? (
          <AddToArchiveIcon className="size-4" />
        ) : (
          <NotYetIcon className="size-4" />
        )}
        {translateArchive("addSubmit")}
      </Button>
    </form>
  )
}
