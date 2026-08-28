// "Poli" holds still while the rest of the name flips through what the association is.
//
// The words are stacked in one grid cell, so the slot is always as wide as the longest of
// them and nothing in the header moves as they change. Pure CSS — no state, no client
// component, and the animation is dropped entirely for prefers-reduced-motion.
//
// Hidden from screen readers: the name is "Poli", and reading six variations of it aloud
// on every page would be noise.

import { ASSOCIATION_NAME } from "@/lib/association"

const WORDMARK_SUFFIXES = [
  "site",
  "Soft",
  "Group",
  "Love",
  "Friends",
  "Everything",
]

/** One full turn through the list, in seconds. */
const CYCLE_SECONDS = WORDMARK_SUFFIXES.length * 2

export function Wordmark() {
  return (
    <span className="font-heading text-lg font-extrabold tracking-tight sm:text-2xl">
      {ASSOCIATION_NAME}
      <span aria-hidden="true" className="wordmark-slot text-primary">
        {WORDMARK_SUFFIXES.map((suffix, index) => (
          <span
            key={suffix}
            className="wordmark-word"
            style={{
              animationDuration: `${CYCLE_SECONDS}s`,
              animationDelay: `${index * 2}s`,
            }}
          >
            {suffix}
          </span>
        ))}
      </span>
    </span>
  )
}
