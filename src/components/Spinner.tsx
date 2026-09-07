// A ring turning on the spot, for the seconds between pressing something and arriving
// somewhere.
//
// Drawn with a border rather than taken from the icon set: an icon would have to be
// rotated by the same trick anyway, and a circle with one transparent quarter is the whole
// drawing. Sized in em so it matches whatever text it sits beside.

import { cn } from "@/lib/utils"

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "size-4 animate-spin rounded-full border-2 border-current border-t-transparent motion-reduce:animate-none",
        className,
      )}
    />
  )
}
