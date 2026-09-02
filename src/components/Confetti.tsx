// Paper over the whole page, for the two moments worth marking: saying you are coming, and
// putting a new event on the calendar.
//
// Fixed and pointer-events: none, so it never eats a click, and skipped entirely under
// prefers-reduced-motion. The caller mounts it and it clears itself when the fall ends.
//
// The scatter is derived from each piece's index and a seed rather than drawn from
// Math.random(). Random during render is impure, which the compiler rightly refuses, and
// pushing it into state costs an effect and a second render for no visible gain. A seed
// from the click that triggered it is enough to make two bursts differ.

"use client"

import { useEffect, useState } from "react"

const PIECES = 70
const FALL_SECONDS = 3.2

// The association's own colours, so it reads as the site celebrating rather than as a
// party-supplies advert.
const CONFETTI_COLOURS = [
  "var(--primary)",
  "var(--primary-ink)",
  "var(--notification)",
  "var(--rsvp-going)",
  "var(--rsvp-interested)",
]

/** A pure 0..1 from three numbers: the fractional part of a large sine. */
function scatter(index: number, seed: number, salt: number): number {
  const value = Math.sin((index + 1) * salt + (seed % 1000)) * 10000
  return value - Math.floor(value)
}

export function Confetti({
  seed = 1,
  onDone,
}: {
  /** Any number from the interaction that set it off, so two bursts differ. */
  seed?: number
  onDone?: () => void
}) {
  const [isFalling, setIsFalling] = useState(true)

  useEffect(() => {
    const finish = window.setTimeout(
      () => {
        setIsFalling(false)
        onDone?.()
      },
      (FALL_SECONDS * 1.3 + 0.6) * 1000,
    )

    return () => window.clearTimeout(finish)
  }, [onDone])

  if (!isFalling) return null

  return (
    <div aria-hidden="true" className="confetti-sky">
      {Array.from({ length: PIECES }, (_, index) => {
        const left = scatter(index, seed, 12.9898) * 100
        const delay = scatter(index, seed, 78.233) * 0.6
        const duration =
          FALL_SECONDS * (0.7 + scatter(index, seed, 43.758) * 0.6)
        const drift = (scatter(index, seed, 94.673) - 0.5) * 30
        const spin = 360 + scatter(index, seed, 27.161) * 720

        return (
          <span
            key={index}
            className="confetti-piece"
            style={{
              left: `${left}%`,
              backgroundColor:
                CONFETTI_COLOURS[index % CONFETTI_COLOURS.length],
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
              ["--confetti-drift" as string]: `${drift.toFixed(1)}vw`,
              ["--confetti-spin" as string]: `${spin.toFixed(0)}deg`,
            }}
          />
        )
      })}
    </div>
  )
}
