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

import { Button } from "@/components/ui/button"
import {
  applyPalette,
  readStoredPalette,
  storePalette,
} from "@/lib/palette-apply"
import { gradientFor, userPalettes } from "@/lib/palette-lab"
import { PaletteBrushIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

/** How long the wheel turns before it closes. Matches palette-wheel-spin in globals.css. */
const SPIN_MS = 520

export function PaletteSwitcher() {
  const translatePalette = useTranslations("Palette")
  const palettes = userPalettes()

  const [isOpen, setIsOpen] = useState(false)
  const [isSpinning, setIsSpinning] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Clicking anywhere else, or pressing escape, puts it away.
  useEffect(() => {
    if (!isOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false)
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false)
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
    setIsSpinning(true)
    window.setTimeout(() => {
      setIsSpinning(false)
      setIsOpen(false)
    }, SPIN_MS)
  }

  function reset() {
    applyPalette(null)
    storePalette(null)
    setIsOpen(false)
  }

  const active = readStoredPalette()

  return (
    <div ref={rootRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label={translatePalette("open")}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <PaletteBrushIcon className="size-4" />
      </Button>

      {isOpen && (
        <div
          className={cn("palette-wheel", isSpinning && "is-spinning")}
          role="group"
          aria-label={translatePalette("open")}
        >
          {palettes.map((palette, index) => (
            <button
              key={palette.key}
              type="button"
              onClick={() => choose(palette.key)}
              title={palette.name}
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
