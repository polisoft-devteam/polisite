// What has happened since you last looked, as a count on a bell.
//
// Closing the list marks everything seen, so the bubble clears itself without asking you
// to dismiss it. Marking on the way in instead would revalidate the header while the list
// was still open and empty it in front of you. Each line links to where the thing is.

"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { markNotificationsSeenAction } from "@/features/notifications/actions"
import { Link } from "@/i18n/navigation"
import { NotificationIcon } from "@/lib/icons"

export type NotificationLine = {
  key: string
  label: string
  count: number
  href: string
}

export function NotificationBell({
  lines,
  total,
  label,
  emptyLabel,
}: {
  lines: NotificationLine[]
  total: number
  label: string
  emptyLabel: string
}) {
  const [isOpen, setIsOpen] = useState(false)

  function open(nextOpen: boolean) {
    setIsOpen(nextOpen)

    // On the way out, so the list survives being read.
    if (!nextOpen && total > 0) void markNotificationsSeenAction()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={open}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={label}
            className="relative"
          />
        }
      >
        <NotificationIcon className="size-4" />

        {total > 0 && (
          <span className="bg-notification absolute top-0.5 right-0.5 flex size-4 items-center justify-center rounded-full text-[0.625rem] font-bold text-white tabular-nums">
            {total > 9 ? "9+" : total}
          </span>
        )}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        {lines.length === 0 ? (
          <p className="text-muted-foreground px-2 py-3 text-sm">
            {emptyLabel}
          </p>
        ) : (
          lines.map((line) => (
            <DropdownMenuItem
              key={line.key}
              onClick={() => setIsOpen(false)}
              render={
                <Link href={line.href} transitionTypes={["nav-forward"]} />
              }
              className="flex justify-between gap-3"
            >
              <span>{line.label}</span>
              <span className="bg-notification rounded-full px-1.5 text-xs font-bold text-white tabular-nums">
                {line.count}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
