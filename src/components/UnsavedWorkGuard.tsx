// Stops a half-filled form being lost to a stray click on the navigation.
//
// Two ways out of a page, two ways to catch it. Closing the tab or reloading is the
// browser's own dialog, which cannot be styled and cannot be skipped. A link inside the
// site is ours: the click is caught before it navigates and the question is asked in our
// own modal, and only then does the page go.
//
// A full navigation rather than the router on purpose: the href already carries its
// language prefix, and handing it back to the language-aware router would prefix it twice.
//
// The back button is not covered. Undoing a history entry mid-question leaves the address
// bar lying about which page you are on, which is worse than losing a form.

"use client"

import { useEffect, useState } from "react"

import { Modal } from "@/components/Modal"
import { Button } from "@/components/ui/button"

export function UnsavedWorkGuard({
  isDirty,
  title,
  body,
  leaveLabel,
  stayLabel,
  closeLabel,
}: {
  /** Nothing is caught until something has actually been typed. */
  isDirty: boolean
  title: string
  body: string
  leaveLabel: string
  stayLabel: string
  closeLabel: string
}) {
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    if (!isDirty) return

    function warnOnUnload(event: BeforeUnloadEvent) {
      event.preventDefault()
    }

    function catchLinkClick(event: MouseEvent) {
      // Anything the browser would not treat as a plain navigation is left alone: a new
      // tab, a middle click, a link that something else has already handled.
      if (event.defaultPrevented || event.button !== 0) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
        return

      const anchor =
        event.target instanceof Element ? event.target.closest("a[href]") : null

      if (!(anchor instanceof HTMLAnchorElement)) return
      if (anchor.target && anchor.target !== "_self") return

      const href = anchor.getAttribute("href")
      if (!href || href.startsWith("#")) return

      // Somewhere else entirely is somebody else's business.
      if (anchor.origin !== window.location.origin) return
      if (anchor.pathname === window.location.pathname) return

      event.preventDefault()
      setPendingHref(anchor.pathname + anchor.search + anchor.hash)
    }

    window.addEventListener("beforeunload", warnOnUnload)
    // Captured, so the question is asked before the router hears the click at all.
    document.addEventListener("click", catchLinkClick, true)

    return () => {
      window.removeEventListener("beforeunload", warnOnUnload)
      document.removeEventListener("click", catchLinkClick, true)
    }
  }, [isDirty])

  if (!pendingHref) return null

  return (
    <Modal
      open
      onOpenChange={(isOpen) => {
        if (!isOpen) setPendingHref(null)
      }}
      title={title}
      description={body}
      closeLabel={closeLabel}
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPendingHref(null)}
          >
            {stayLabel}
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => window.location.assign(pendingHref)}
          >
            {leaveLabel}
          </Button>
        </>
      }
    />
  )
}
