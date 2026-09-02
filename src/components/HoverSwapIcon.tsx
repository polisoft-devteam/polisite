// Two icons in one slot: the second replaces the first while the button is hovered.
//
// Both are rendered and crossfaded rather than swapped in the DOM, so the button never
// changes width halfway through and the change reads as one thing turning into another.
//
// Relies on the button's own `group/button` class, so it only works inside one.

import type { ComponentType } from "react"

export function HoverSwapIcon({
  Idle,
  Hover,
  className = "size-5",
}: {
  Idle: ComponentType<{ className?: string }>
  Hover: ComponentType<{ className?: string }>
  className?: string
}) {
  return (
    <span className="relative inline-flex shrink-0 items-center justify-center">
      <Idle
        className={`${className} transition-opacity duration-300 group-hover/button:opacity-0 motion-reduce:transition-none`}
      />
      <Hover
        className={`${className} absolute opacity-0 transition-opacity duration-300 group-hover/button:opacity-100 motion-reduce:transition-none`}
      />
    </span>
  )
}
