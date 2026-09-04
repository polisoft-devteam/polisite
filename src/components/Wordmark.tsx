// "Poli" holds still while the rest of the name flips through what the association is.
//
// The words are stacked in one grid cell, so the slot is always as wide as the longest of
// them and nothing in the header moves as they change. Pure CSS — no state, no client
// component, and the animation is dropped entirely for prefers-reduced-motion.
//
// Hidden from screen readers: the name is "Poli", and reading a dozen variations of it
// aloud on every page would be noise.

import { ASSOCIATION_NAME } from "@/lib/association"

// Soft leads: it is the one the association actually goes by, and it is what a reader
// with reduced motion sees held still.
const WORDMARK_SUFFIXES = [
  "Soft",
  "site",
  "Group",
  "OneLove",
  "Speak",
  "Friends",
  "Everything",
  "Community",
  "Games",
  "Vacation",
  "Thailand",
  "Craft",
  "Trip",
  "Wagooo",
  "Code",
  "BP",
  "420",
  "239",
  "BootyBoys",
  "Dev",
  "Borås",
]

/** How long each word holds the slot. */
const SECONDS_PER_WORD = 2
const CYCLE_SECONDS = WORDMARK_SUFFIXES.length * SECONDS_PER_WORD

/**
 * The keyframes have to be generated, because each word's visible window is a fraction of
 * the whole cycle — add a word and every percentage moves. Hard-coding them in globals.css
 * would mean the animation silently breaks the next time this list changes.
 */
const wordmarkKeyframes = (() => {
  const window = 100 / WORDMARK_SUFFIXES.length

  return `@keyframes wordmark-flip {
  0% { opacity: 0; transform: rotateX(-90deg); }
  ${(window * 0.18).toFixed(3)}% { opacity: 1; transform: rotateX(0); }
  ${(window * 0.82).toFixed(3)}% { opacity: 1; transform: rotateX(0); }
  ${window.toFixed(3)}% { opacity: 0; transform: rotateX(90deg); }
  100% { opacity: 0; transform: rotateX(90deg); }
}`
})()

export function Wordmark() {
  return (
    <span className="font-heading text-base font-extrabold tracking-tight sm:text-lg lg:text-3xl xl:text-4xl">
      <style>{wordmarkKeyframes}</style>

      {/* The name stays plain text; only the word that flips carries the gradient.
          The clip is on each flipping word rather than on anything above them: put it on
          an ancestor and it fights their 3D rotation, which drew the suffix inside the
          name. */}
      <span className="text-foreground">{ASSOCIATION_NAME}</span>

      <span aria-hidden="true" className="wordmark-slot text-primary-ink">
        {WORDMARK_SUFFIXES.map((suffix, index) => (
          <span
            key={suffix}
            className="wordmark-word brand-text"
            style={{
              animationDuration: `${CYCLE_SECONDS}s`,
              animationDelay: `${index * SECONDS_PER_WORD}s`,
            }}
          >
            {suffix}
          </span>
        ))}
      </span>
    </span>
  )
}
