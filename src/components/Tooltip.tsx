// A small label that appears when you hover or focus something.
//
// For a control whose meaning is in its appearance rather than in words: a colour, an icon,
// a swatch. Not for anything a screen reader needs, which wants an accessible name on the
// control itself and gets one whether or not a pointer is ever used.
//
// Base UI does the positioning and the focus handling, so this is only the look and the
// two delays: quick enough to feel like an answer, slow enough not to fire on the way past.

"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

export function Tooltip({
  label,
  side = "bottom",
  sideOffset = 6,
  className,
  children,
}: {
  label: string
  side?: TooltipPrimitive.Positioner.Props["side"]
  sideOffset?: number
  className?: string
  /** The control it belongs to. Rendered as the trigger, so it keeps its own semantics. */
  children: React.ReactElement
}) {
  return (
    // The delays live on the provider rather than the root. One per tooltip is fine: it
    // is a grouping for shared timing, not a thing that has to sit at the top of the app.
    <TooltipPrimitive.Provider delay={280} closeDelay={80}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger render={children} />

        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Positioner
            className="z-50 outline-none"
            side={side}
            sideOffset={sideOffset}
          >
            <TooltipPrimitive.Popup
              data-slot="tooltip"
              className={cn(
                "bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 origin-(--transform-origin) rounded-md px-2 py-1 text-xs font-medium shadow-md ring-1 duration-100 outline-none",
                className,
              )}
            >
              {label}
            </TooltipPrimitive.Popup>
          </TooltipPrimitive.Positioner>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}
