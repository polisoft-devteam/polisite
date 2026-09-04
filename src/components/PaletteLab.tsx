// Pick a brand colour and wear it around the site.
//
// The choice injects a stylesheet that redefines the palette tokens, so every page follows
// without a reload: the whole app resolves to those tokens, which is the thing globals.css
// promised and this is the proof.
//
// It is kept in this browser and sent nowhere. Nobody else sees your experiment, and the
// shipped palette is one click away.

"use client"

import { useSyncExternalStore } from "react"

import { Button } from "@/components/ui/button"
import {
  PALETTE_CANDIDATES,
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
  findPaletteCandidate,
  fillFor,
  gradientFor,
  paletteCss,
  type PaletteCandidate,
} from "@/lib/palette-lab"
import { cn } from "@/lib/utils"
import { ReplayIcon } from "@/lib/icons"

// The choice lives in localStorage, which is an external store, so it is read as one rather
// than copied into state by an effect. Copying it would mean a setState during render's
// commit, which the React compiler rightly refuses.
const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function readChoice(): string | null {
  try {
    return localStorage.getItem(PALETTE_STORAGE_KEY)
  } catch {
    // A browser refusing storage is not worth failing a page over.
    return null
  }
}

/** Nothing is chosen on the server: there is no browser to have chosen in. */
function readServerChoice(): null {
  return null
}

function applyPalette(candidate: PaletteCandidate | null) {
  const existing = document.getElementById(PALETTE_STYLE_ID)

  if (!candidate) {
    existing?.remove()
    return
  }

  const style = existing ?? document.createElement("style")
  style.id = PALETTE_STYLE_ID
  style.textContent = paletteCss(candidate)

  // Last in head, so it beats globals.css at equal specificity.
  if (!existing) document.head.appendChild(style)
}

export function PaletteLab() {
  const activeKey = useSyncExternalStore(
    subscribe,
    readChoice,
    readServerChoice,
  )

  function choose(key: string | null) {
    applyPalette(key ? (findPaletteCandidate(key) ?? null) : null)

    try {
      if (key) localStorage.setItem(PALETTE_STORAGE_KEY, key)
      else localStorage.removeItem(PALETTE_STORAGE_KEY)
    } catch {}

    listeners.forEach((listener) => listener())
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground max-w-prose text-sm">
        Pick one and the whole site wears it, this page and every other, until
        you put it back. It lives in this browser only. Semantic colours stay
        put, so you can see whether a new brand hue crowds the red that means
        danger or the amber that means a suggestion.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PALETTE_CANDIDATES.map((candidate) => {
          const isActive = candidate.key === activeKey
          // The same helpers the stylesheet uses, so the swatch cannot show one thing and
          // the buttons another.
          const fill = gradientFor(candidate) ?? fillFor(candidate)
          const stops = candidate.gradientStops?.length ?? 0

          return (
            <li key={candidate.key}>
              <button
                type="button"
                aria-pressed={isActive}
                onClick={() => choose(candidate.key)}
                className={cn(
                  "border-border bg-card w-full cursor-pointer overflow-hidden rounded-lg border text-left transition-colors",
                  isActive ? "border-primary-ink" : "hover:border-input",
                )}
              >
                <span
                  aria-hidden="true"
                  className="block h-12 w-full"
                  style={{ background: fill }}
                />

                <span className="block px-3 py-2.5">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-medium">
                      {candidate.name}
                    </span>
                    {stops > 0 && (
                      <span className="text-muted-foreground text-[0.65rem] tracking-wide uppercase">
                        {stops} färger
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground block text-xs">
                    {candidate.note}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => choose(null)}
          disabled={activeKey === null}
        >
          <ReplayIcon className="size-4" />
          Tillbaka till den riktiga paletten
        </Button>

        <span className="text-muted-foreground text-xs">
          {activeKey
            ? `Provar ${findPaletteCandidate(activeKey)?.name ?? activeKey}. Ingen annan ser det.`
            : "Sidan visar paletten som ligger i globals.css."}
        </span>
      </div>
    </div>
  )
}
