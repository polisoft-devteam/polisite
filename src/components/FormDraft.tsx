// Keeps a part-filled form, so leaving it does not throw the work away.
//
// The event wizard hides the steps you are not on rather than unmounting them, which ought
// to keep their values in the DOM by itself. It does not, and rather than keep guessing at
// why, the form now remembers what you typed and puts it back. That also covers the cases
// the wizard never could: the browser's back button, and switching language mid-form.
//
// sessionStorage rather than localStorage: a half-written event is worth keeping across a
// navigation, not across a week.
//
// Values only, never files: a file input cannot be filled from script, and a photo has no
// business sitting in storage.

"use client"

import { useEffect, useRef } from "react"

/** Fields whose value is either meaningless to restore or impossible to. */
function isRestorable(
  field: Element,
): field is HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  if (
    !(field instanceof HTMLInputElement) &&
    !(field instanceof HTMLSelectElement) &&
    !(field instanceof HTMLTextAreaElement)
  ) {
    return false
  }

  return Boolean(field.name) && field.type !== "file" && field.type !== "hidden"
}

export function FormDraft({ storageKey }: { storageKey: string }) {
  const anchorRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const form = anchorRef.current?.closest("form")
    if (!form) return

    function fields() {
      return Array.from(form!.elements).filter(isRestorable)
    }

    function read(): Record<string, string | boolean> {
      const draft: Record<string, string | boolean> = {}

      for (const field of fields()) {
        // A repeated name is a list, and the rows that hold it are built from state we
        // cannot restore into. Left alone rather than half restored.
        if (form!.querySelectorAll(`[name="${field.name}"]`).length > 1)
          continue

        draft[field.name] =
          field instanceof HTMLInputElement &&
          (field.type === "checkbox" || field.type === "radio")
            ? field.checked
            : field.value
      }

      return draft
    }

    try {
      const saved = sessionStorage.getItem(storageKey)

      if (saved) {
        const draft = JSON.parse(saved) as Record<string, string | boolean>

        for (const field of fields()) {
          const value = draft[field.name]
          if (value === undefined) continue

          if (
            field instanceof HTMLInputElement &&
            (field.type === "checkbox" || field.type === "radio")
          ) {
            field.checked = Boolean(value)
          } else if (typeof value === "string") {
            field.value = value
          }
        }
      }
    } catch {
      // A corrupt or unavailable store is not worth failing a page over.
    }

    // Merged into whatever is already stored rather than replacing it. A field that is
    // not in the DOM right now, because a section is collapsed or a step is elsewhere,
    // must keep the value it had rather than be dropped from the draft.
    function save() {
      try {
        const existing = JSON.parse(
          sessionStorage.getItem(storageKey) ?? "{}",
        ) as Record<string, string | boolean>

        sessionStorage.setItem(
          storageKey,
          JSON.stringify({ ...existing, ...read() }),
        )
      } catch {
        // Private browsing, a full quota: losing the draft beats losing the form.
      }
    }

    function clear() {
      try {
        sessionStorage.removeItem(storageKey)
      } catch {}
    }

    form.addEventListener("input", save)
    form.addEventListener("change", save)
    form.addEventListener("submit", clear)

    return () => {
      form.removeEventListener("input", save)
      form.removeEventListener("change", save)
      form.removeEventListener("submit", clear)
    }
  }, [storageKey])

  return <span ref={anchorRef} hidden />
}
