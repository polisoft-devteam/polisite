// A spinner that appears inside a link while the page it points at is still coming.
//
// Next tells a link's own children whether its navigation is pending, which is the only
// way to know: the click has been handled, the page is being fetched, and nothing on
// screen has changed yet. On a slow connection that is a second or two of a button that
// looks ignored.
//
// Renders nothing at rest, so it costs a link nothing to carry one.

"use client"

import { useLinkStatus } from "next/link"

import { Spinner } from "@/components/Spinner"

export function NavigationSpinner({ className }: { className?: string }) {
  const { pending } = useLinkStatus()

  if (!pending) return null

  return <Spinner className={className} />
}
