// The brush in the header: four palettes on a wheel that spins shut when you pick one.
//
// A wheel rather than a dropdown because there are exactly four and they are colours: a
// list of names would make you read what you can see. Each sits on an arc below the brush,
// so nothing overlaps the navigation beside it.
//
// The choice is this browser's alone and is sent nowhere.

"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { Tooltip } from "@/components/Tooltip"
import { Button } from "@/components/ui/button"
import {
  applyPalette,
  readStoredPalette,
  storePalette,
} from "@/lib/palette-apply"
import { gradientFor, userPalettes } from "@/lib/palette-lab"
import { PaletteBrushIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

/** Matches palette-wheel-spin in globals.css: the turn after a colour is chosen. */
const PICKED_MS = 520

/** Matches palette-spoke-out, plus the stagger the last spoke waits out. */
const DISMISS_MS = 420

export function PaletteSwitcher() {
  const translatePalette = useTranslations("Palette")
  const palettes = userPalettes()

  const [isOpen, setIsOpen] = useState(false)
  // Not a boolean: the wheel turns when a colour was chosen and simply retreats when it
  // was waved away, and both need to finish before it comes off the page.
  const [closing, setClosing] = useState<"picked" | "dismissed" | null>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  function close(how: "picked" | "dismissed") {
    setClosing(how)
    window.setTimeout(
      () => {
        setClosing(null)
        setIsOpen(false)
      },
      how === "picked" ? PICKED_MS : DISMISS_MS,
    )
  }

  // Clicking anywhere else, or pressing escape, puts it away.
  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close("dismissed")
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") close("dismissed")
    }

    document.addEventListener("pointerdown", onPointerDown)
    document.addEventListener("keydown", onKeyDown)

    return () => {
      document.removeEventListener("pointerdown", onPointerDown)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [isOpen])

  function choose(key: string) {
    const candidate = palettes.find((palette) => palette.key === key) ?? null

    applyPalette(candidate)
    storePalette(key)

    // The colour lands at once; the wheel takes its turn on the way out.
    close("picked")
  }

  function reset() {
    applyPalette(null)
    storePalette(null)
    close("picked")
  }

  const active = readStoredPalette()

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={translatePalette("open")}
        aria-expanded={isOpen}
        onClick={() => (isOpen ? close("dismissed") : setIsOpen(true))}
      >
        <PaletteBrushIcon className="size-4" />
      </Button>

      {isOpen && (
        <div
          className={cn(
            "palette-wheel",
            closing && "is-closing",
            closing === "picked" && "is-picked",
          )}
          role="group"
          aria-label={translatePalette("open")}
        >
          {palettes.map((palette, index) => (
            // A swatch is a colour and nothing else, so the name has to arrive on hover.
            // The label is on the button too, for anyone who never hovers anything.
            <Tooltip key={palette.key} label={palette.name} side="right">
              <button
                type="button"
                onClick={() => choose(palette.key)}
                aria-label={palette.name}
                aria-pressed={palette.key === active}
                className={cn(
                  "palette-spoke ring-background size-8 cursor-pointer rounded-full ring-2 transition-transform",
                  palette.key === active && "ring-foreground",
                )}
                style={{
                  background: gradientFor(palette) ?? undefined,
                  // Fanned across the arc below the brush, and staggered so they arrive
                  // one after another rather than all at once.
                  ["--spoke-angle" as string]: `${52 + index * 26}deg`,
                  animationDelay: `${index * 45}ms`,
                }}
              />
            </Tooltip>
          ))}

          <button
            type="button"
            onClick={reset}
            className="palette-reset text-muted-foreground hover:text-foreground bg-card ring-border absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded-md px-2 py-1 text-[0.65rem] whitespace-nowrap ring-1"
          >
            {translatePalette("reset")}
          </button>
        </div>
      )}
    </div>
  )
}
