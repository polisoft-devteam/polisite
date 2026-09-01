// Clears the badge once the list has been rendered.
//
// A effect rather than a mutation during render: a server component that wrote on every
// render would fight its own revalidation, and the rows still need to be readable on the
// visit that clears them.

"use client"

import { useEffect } from "react"

import { markNotificationsSeenAction } from "@/features/notifications/actions"

export function MarkNotificationsSeen() {
  useEffect(() => {
    void markNotificationsSeenAction()
  }, [])

  return null
}
