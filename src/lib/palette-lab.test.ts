// The lab generates a stylesheet that overrides the real palette. If it drifts from
// globals.css it stops telling the truth about what a colour would look like, which is the
// only thing it is for.

import { describe, expect, it } from "vitest"

import {
  PALETTE_CANDIDATES,
  findPaletteCandidate,
  paletteCss,
} from "@/lib/palette-lab"

const mint = findPaletteCandidate("mint")!
const apricot = findPaletteCandidate("apricot")!
const gradient = findPaletteCandidate("apricot-lilac")!

describe("the generated stylesheet", () => {
  it("writes both themes, since the two differ", () => {
    const css = paletteCss(apricot)

    expect(css).toContain(":root {")
    expect(css).toContain(".dark {")
  })

  it("reproduces the shipped palette exactly when the shipped hue is chosen", () => {
    const css = paletteCss(mint)

    // The values as globals.css has them today.
    expect(css).toContain("--primary: oklch(0.876 0.125 168);")
    expect(css).toContain("--primary-ink: oklch(0.5 0.11 168);")
    expect(css).toContain("--background: oklch(0.99 0.003 168);")
    // The neutrals sit three degrees off the brand.
    expect(css).toContain("--foreground: oklch(0.21 0.017 171);")
  })

  it("moves every brand token to the new hue together", () => {
    const css = paletteCss(apricot)
    const hues = [...css.matchAll(/oklch\([\d.]+ [\d.]+ (\d+)\)/g)].map(
      (match) => Number(match[1]),
    )

    // Only the brand hue and the neutrals three degrees off it.
    expect(new Set(hues)).toEqual(new Set([55, 58]))
  })

  it("brings the chroma down for a hue that cannot carry the shipped amount", () => {
    // Apricot maxes out around 0.077 at the fill's lightness; mint reaches 0.177.
    expect(paletteCss(apricot)).toContain("--primary: oklch(0.876 0.078 55);")
  })

  it("leaves the semantic colours out, so a collision stays visible", () => {
    const css = paletteCss(apricot)

    for (const semantic of [
      "--destructive",
      "--success",
      "--info",
      "--rsvp-going",
      "--rsvp-interested",
      "--rsvp-not-going",
      "--notification",
      "--suggestion-ink",
    ]) {
      expect(css).not.toContain(semantic)
    }
  })
})

describe("gradient candidates", () => {
  it("fills the sweep with the pair, in both themes", () => {
    const css = paletteCss(gradient)
    const sweeps = css.match(/--button-sweep: linear-gradient\([^;]+\);/g) ?? []

    expect(sweeps).toHaveLength(2)
    expect(sweeps[0]).toContain("55)")
    expect(sweeps[0]).toContain("310)")
  })

  it("never hands a gradient to --button-accent, which is also a border colour", () => {
    expect(paletteCss(gradient)).not.toContain("--button-accent")
  })

  it("gives a solid candidate no sweep at all", () => {
    expect(paletteCss(apricot)).not.toContain("--button-sweep")
  })
})

describe("the candidate list", () => {
  it("has no repeated keys, which would make one unreachable", () => {
    const keys = PALETTE_CANDIDATES.map((candidate) => candidate.key)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it("offers the shipped palette, so there is always a way back", () => {
    expect(findPaletteCandidate("mint")).toBeDefined()
  })
})
