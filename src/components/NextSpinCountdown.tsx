// How long until the wheel gives you another go.
//
// Counts down to midnight in Stockholm, which is when the day turns over and an empty
// wheel is topped up. A second's tick rather than a minute's: the last minute is the one
// anybody is actually watching.
//
// Rendered only when there is nothing left to spin. With a spin in hand the answer is
// "now", and nobody needs a clock for that.

"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"

import { nextStockholmMidnight } from "@/lib/time"

/** "2:04:37", and "0:59" once there is under an hour left. */
function formatRemaining(milliseconds: number): string {
  const total = Math.max(Math.floor(milliseconds / 1000), 0)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const padded = (value: number) => String(value).padStart(2, "0")

  return hours > 0
    ? `${hours}:${padded(minutes)}:${padded(seconds)}`
    : `${minutes}:${padded(seconds)}`
}

export function NextSpinCountdown() {
  const translateElection = useTranslations("Election")
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    // Set on a tick rather than on mount: the server has no clock in the reader's
    // timezone, and a first render with one number and a second with another is a
    // hydration mismatch. Null renders nothing at all.
    const tick = () =>
      setRemaining(nextStockholmMidnight().getTime() - Date.now())

    const timer = window.setInterval(tick, 1000)
    tick()

    return () => window.clearInterval(timer)
  }, [])

  if (remaining === null) return null

  return (
    <p className="text-muted-foreground text-sm tabular-nums">
      {translateElection("nextSpinIn", { time: formatRemaining(remaining) })}
    </p>
  )
}
