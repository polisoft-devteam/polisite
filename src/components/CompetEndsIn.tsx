// How long a duel has left, or when it ended.
//
// Counts in days and hours while there is time, and down to the second in the last hour,
// which is the hour anybody is watching. Reaching zero refreshes the page, so voting
// closes on screen at the moment it closes on the server.

"use client"

import { useEffect, useState } from "react"
import { useFormatter, useTranslations } from "next-intl"

import { useRouter } from "@/i18n/navigation"
import { PendingIcon } from "@/lib/icons"

const HOUR_MILLISECONDS = 60 * 60 * 1000
const DAY_MILLISECONDS = 24 * HOUR_MILLISECONDS

export function CompetEndsIn({
  endsAt,
  isOpen,
}: {
  endsAt: Date
  isOpen: boolean
}) {
  const translateCompet = useTranslations("Compet")
  const format = useFormatter()
  const router = useRouter()

  // Null until the first tick after mount; see NextSpinCountdown for why.
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    if (!isOpen) return

    const tick = () => setNow(Date.now())

    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [isOpen])

  const remaining = now === null ? null : endsAt.getTime() - now
  const hasJustEnded = isOpen && remaining !== null && remaining <= 0

  useEffect(() => {
    if (hasJustEnded) router.refresh()
  }, [hasJustEnded, router])

  const endedOn = format.dateTime(endsAt, {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Stockholm",
  })

  let label: string | null = null

  if (!isOpen || hasJustEnded) {
    label = translateCompet("endedOn", { date: endedOn })
  } else if (remaining !== null) {
    const days = Math.floor(remaining / DAY_MILLISECONDS)
    const hours = Math.floor((remaining % DAY_MILLISECONDS) / HOUR_MILLISECONDS)
    const totalSeconds = Math.floor(remaining / 1000)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = String(totalSeconds % 60).padStart(2, "0")

    label =
      remaining >= DAY_MILLISECONDS
        ? translateCompet("endsInDays", { days, hours })
        : remaining >= HOUR_MILLISECONDS
          ? translateCompet("endsInHours", { hours, minutes })
          : translateCompet("endsInClock", { time: `${minutes}:${seconds}` })
  }

  return (
    <p className="text-muted-foreground flex min-h-5 items-center justify-center gap-1.5 text-sm tabular-nums">
      {label && (
        <>
          <PendingIcon className="size-3.5" />
          {label}
        </>
      )}
    </p>
  )
}
