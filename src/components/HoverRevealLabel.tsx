// An icon that grows its label out to the right on hover.
//
// For the header, where a long email pushed everything else together. The label is still
// in the accessibility tree while collapsed, because it is clipped to zero width rather
// than removed, and keyboard focus opens it the same way a pointer does.
//
// The width animates as a grid column from 0fr to 1fr, which resolves to exactly the
// label's own width. Animating max-width instead means picking a maximum larger than any
// label, so the extra range animates invisibly: opening looks fast and finishes early,
// closing looks like nothing happens and then it drops. Same duration, wrong feel.
//
// The `group/reveal` class belongs on the focusable ancestor, the link or button, not here:
// keyboard focus lands there, and a group on an inner span would never see it.

import { cn } from "@/lib/utils"

export function HoverRevealLabel({
  icon,
  label,
  className,
}: {
  icon: React.ReactNode
  label: string
  className?: string
}) {
  return (
    <span className={cn("flex items-center gap-1.5", className)}>
      {icon}

      <span className="grid grid-cols-[0fr] transition-[grid-template-columns] duration-1000 ease-in-out group-hover/reveal:grid-cols-[1fr] group-focus-visible/reveal:grid-cols-[1fr] motion-reduce:transition-none">
        <span className="overflow-hidden text-sm whitespace-nowrap opacity-0 transition-opacity duration-1000 ease-in-out group-hover/reveal:opacity-100 group-focus-visible/reveal:opacity-100 motion-reduce:transition-none">
          {label}
        </span>
      </span>
    </span>
  )
}
