// An icon that grows its label out to the right on hover.
//
// For the header, where a long email pushed everything else together. The label is still
// in the accessibility tree while collapsed, because it is clipped to zero width rather
// than removed, and keyboard focus opens it the same way a pointer does.
//
// Widths are set rather than animated to `auto`, which does not transition. The max has to
// clear the longest label it will hold; anything past it is truncated instead of wrapping.
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

      <span className="max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-[max-width,opacity] duration-300 ease-out group-hover/reveal:max-w-40 group-hover/reveal:opacity-100 group-focus-visible/reveal:max-w-40 group-focus-visible/reveal:opacity-100 motion-reduce:transition-none">
        <span className="block truncate pr-0.5 text-sm">{label}</span>
      </span>
    </span>
  )
}
