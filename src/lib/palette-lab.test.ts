// The lab generates a stylesheet that overrides the real palette. If it drifts from
// globals.css it stops telling the truth about what a colour would look like, which is the
// only thing it is for.

import { describe, expect, it } from "vitest"

import {
  PALETTE_CANDIDATES,
  USER_PALETTE_KEYS,
  userPalettes,
  findPaletteCandidate,
  gradientFor,
  inkGradientFor,
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

  it("carries every stop of a three colour gradient, in order", () => {
    const sunset = findPaletteCandidate("sunset")!
    const sweep = paletteCss(sunset).match(/--button-sweep: ([^;]+);/)![1]

    expect(sweep).toBe(
      "linear-gradient(96deg, oklch(0.876 0.125 85), oklch(0.876 0.066 25), oklch(0.876 0.071 300))",
    )
  })

  it("gives each stop the chroma its own hue can hold", () => {
    // A blue cannot carry what a teal can at this lightness. One scale across the pair
    // would flatten whichever end could not take it.
    const fizz = findPaletteCandidate("fizz")!
    const [blue, pink] = fizz.gradientStops!

    expect(blue[1]).not.toBe(pink[1])
    expect(gradientFor(fizz)).toContain("oklch(0.876 0.063 250)")
    expect(gradientFor(fizz)).toContain("oklch(0.876 0.083 345)")
  })

  it("has no gradient for a solid candidate", () => {
    expect(gradientFor(findPaletteCandidate("mint")!)).toBe(null)
    expect(inkGradientFor(findPaletteCandidate("mint")!)).toBe(null)
  })

  it("darkens the gradient for text, since the fill is 1.4:1 on white", () => {
    const fizz = findPaletteCandidate("fizz")!

    expect(gradientFor(fizz)).toContain("oklch(0.876")
    expect(inkGradientFor(fizz)).toContain("oklch(0.5")
    expect(inkGradientFor(fizz)).not.toContain("0.876")
  })

  it("keeps the two the same in dark mode, as --primary-ink already does", () => {
    const css = paletteCss(findPaletteCandidate("fizz")!)
    const dark = css.slice(css.indexOf(".dark {"))

    const fill = dark.match(/--button-sweep: ([^;]+);/)![1]
    const ink = dark.match(/--brand-sweep-ink: ([^;]+);/)![1]

    expect(ink).toBe(fill)
  })

  it("hands the letters over only when there is a gradient to show", () => {
    // Without this the wordmark would be clipped to a gradient that is not there, and
    // vanish on every solid palette.
    expect(paletteCss(findPaletteCandidate("fizz")!)).toContain(
      "--brand-text-fill: transparent;",
    )
    expect(paletteCss(findPaletteCandidate("mint")!)).not.toContain(
      "--brand-text-fill",
    )
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

  it("gives every gradient at least two stops, or it is not one", () => {
    for (const candidate of PALETTE_CANDIDATES) {
      if (!candidate.gradientStops) continue
      expect(candidate.gradientStops.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("starts every gradient on the hue its solid tokens use", () => {
    // Otherwise the button sweeps into a colour the rest of the page never shows.
    for (const candidate of PALETTE_CANDIDATES) {
      if (!candidate.gradientStops) continue
      expect(candidate.gradientStops[0][0]).toBe(candidate.hue)
    }
  })
})

describe("the four offered in the header", () => {
  it("all exist, so the brush cannot open on an empty wheel", () => {
    expect(userPalettes()).toHaveLength(USER_PALETTE_KEYS.length)
    for (const palette of userPalettes()) expect(palette).toBeDefined()
  })

  it("are all gradients, since a wheel of flat colours is a different feature", () => {
    for (const palette of userPalettes()) {
      expect(palette.gradientStops).toBeDefined()
      expect(gradientFor(palette)).toContain("linear-gradient")
    }
  })

  it("is a short list, because every member on a different palette is its own problem", () => {
    expect(userPalettes().length).toBeLessThanOrEqual(4)
  })
})
