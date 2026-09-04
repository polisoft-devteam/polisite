// Puts the palette experiment back on after a reload.
//
// The lab injects a stylesheet, which lives only as long as the document. Without this,
// choosing a colour on /design and then refreshing /events would quietly show the shipped
// palette and make the lab look broken.
//
// Renders nothing and reads one key. If nobody is experimenting, it does nothing at all.

"use client"

import { useEffect } from "react"

import {
  PALETTE_STORAGE_KEY,
  PALETTE_STYLE_ID,
  findPaletteCandidate,
  paletteCss,
} from "@/lib/palette-lab"

export function PaletteLoader() {
  useEffect(() => {
    let key: string | null = null

    try {
      key = localStorage.getItem(PALETTE_STORAGE_KEY)
    } catch {
      return
    }

    if (!key) return

    const candidate = findPaletteCandidate(key)
    if (!candidate) return

    // Already there after a soft navigation; only a fresh document needs it.
    if (document.getElementById(PALETTE_STYLE_ID)) return

    const style = document.createElement("style")
    style.id = PALETTE_STYLE_ID
    style.textContent = paletteCss(candidate)
    document.head.appendChild(style)
  }, [])

  return null
}
