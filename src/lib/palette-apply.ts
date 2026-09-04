// Putting a palette on the document, and remembering it.
//
// Three things do this now: the lab on /design, the brush in the header, and the loader
// that puts it back after a reload. One copy, so they cannot disagree about where the
// choice is kept or how the stylesheet is named.

import {
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
  findPaletteCandidate,
  paletteCss,
  type PaletteCandidate,
} from "@/lib/palette-lab"

/** Replaces the override, or takes it off entirely when given nothing. */
export function applyPalette(candidate: PaletteCandidate | null) {
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

export function readStoredPalette(): string | null {
  try {
    return localStorage.getItem(PALETTE_STORAGE_KEY)
  } catch {
    // A browser refusing storage is not worth failing a page over.
    return null
  }
}

export function storePalette(key: string | null) {
  try {
    if (key) localStorage.setItem(PALETTE_STORAGE_KEY, key)
    else localStorage.removeItem(PALETTE_STORAGE_KEY)
  } catch {}
}

/** Read the choice and wear it. Returns what was applied, if anything. */
export function applyStoredPalette(): PaletteCandidate | null {
  const key = readStoredPalette()
  if (!key) return null

  const candidate = findPaletteCandidate(key)
  if (!candidate) return null

  applyPalette(candidate)
  return candidate
}
