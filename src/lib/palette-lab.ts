// Trying a different brand colour on the whole site without editing globals.css.
//
// Every colour in the palette is the same hue at a different lightness, so a candidate is
// really just a hue and how much chroma that hue can carry. The tables below mirror the two
// blocks in globals.css exactly: change one there and change it here, or the lab stops
// telling the truth.
//
// Semantic colours are left alone on purpose. Destructive, success and the RSVP ramp mean
// something whatever the brand is, and a lab that moved them would hide the one thing worth
// seeing: whether a new brand hue collides with them.

/** A token, as globals.css writes it: a lightness, a chroma, and the hue plus an offset. */
type TokenTemplate = readonly [
  name: string,
  lightness: number,
  chroma: number,
  hueOffset: number,
]

/** The neutrals sit three degrees off the brand, which is what the offset carries. */
const LIGHT_TOKENS: TokenTemplate[] = [
  ["background", 0.99, 0.003, 0],
  ["foreground", 0.21, 0.017, 3],
  ["primary", 0.876, 0.125, 0],
  ["primary-foreground", 0.21, 0.03, 0],
  ["primary-ink", 0.5, 0.11, 0],
  ["secondary", 0.94, 0.02, 0],
  ["secondary-foreground", 0.32, 0.03, 0],
  ["muted", 0.96, 0.006, 0],
  ["muted-foreground", 0.51, 0.019, 3],
  ["accent", 0.74, 0.088, 0],
  ["accent-foreground", 0.24, 0.035, 0],
  ["border", 0.9, 0.008, 0],
  ["input", 0.89, 0.009, 0],
  ["ring", 0.5, 0.11, 0],
  ["sidebar", 0.98, 0.005, 0],
  ["chart-1", 0.4, 0.07, 0],
  ["chart-2", 0.5, 0.085, 0],
  ["chart-3", 0.62, 0.088, 0],
  ["chart-4", 0.74, 0.088, 0],
  ["chart-5", 0.86, 0.08, 0],
  ["suggestion-from", 0.5, 0.11, 0],
  ["suggestion-to", 0.7, 0.088, 0],
  ["suggestion-foreground", 0.99, 0.004, 0],
]

const DARK_TOKENS: TokenTemplate[] = [
  ["background", 0.18, 0.012, 3],
  ["foreground", 0.95, 0.005, 0],
  ["card", 0.22, 0.014, 3],
  ["popover", 0.22, 0.014, 3],
  ["primary", 0.876, 0.125, 0],
  ["primary-foreground", 0.19, 0.028, 0],
  ["primary-ink", 0.876, 0.125, 0],
  ["secondary", 0.31, 0.022, 0],
  ["secondary-foreground", 0.93, 0.014, 0],
  ["muted", 0.26, 0.012, 3],
  ["muted-foreground", 0.69, 0.016, 0],
  ["accent", 0.62, 0.08, 0],
  ["accent-foreground", 0.97, 0.01, 0],
  ["border", 0.31, 0.013, 3],
  ["input", 0.34, 0.014, 3],
  ["ring", 0.876, 0.125, 0],
  ["chart-1", 0.44, 0.065, 0],
  ["chart-2", 0.56, 0.078, 0],
  ["chart-3", 0.68, 0.085, 0],
  ["chart-4", 0.8, 0.088, 0],
  ["chart-5", 0.876, 0.125, 0],
  ["suggestion-from", 0.876, 0.125, 0],
  ["suggestion-to", 0.66, 0.082, 0],
  ["suggestion-foreground", 0.16, 0.025, 0],
]

export type PaletteCandidate = {
  key: string
  name: string
  /** What it is like to look at, in a few words. */
  note: string
  hue: number
  /**
   * How much of the shipped chroma this hue can hold at the fill's lightness. Mint carries
   * 0.177 up there and apricot manages 0.077, so a pastel has to come down or the browser
   * flattens it somewhere nobody chose.
   */
  chromaScale: number
  /** A second hue, for a candidate whose buttons fill with a gradient. */
  gradientHue?: number
}

export const PALETTE_CANDIDATES: PaletteCandidate[] = [
  {
    key: "mint",
    name: "Mint",
    note: "Shipped today. Fresh, a little clinical.",
    hue: 168,
    chromaScale: 1,
  },
  {
    key: "apricot",
    name: "Apricot",
    note: "Warm and sociable. Reads like a club.",
    hue: 55,
    chromaScale: 0.62,
  },
  {
    key: "gold",
    name: "Gold",
    note: "Warmer than apricot, and holds far more colour.",
    hue: 88,
    chromaScale: 1,
  },
  {
    key: "periwinkle",
    name: "Periwinkle",
    note: "Calm, faintly formal.",
    hue: 285,
    chromaScale: 0.5,
  },
  {
    key: "sky",
    name: "Sky",
    note: "The safe one, and the least distinctive.",
    hue: 240,
    chromaScale: 0.54,
  },
  {
    key: "bubblegum",
    name: "Bubblegum",
    note: "Playful. Crowds the red that means danger.",
    hue: 355,
    chromaScale: 0.59,
  },
  {
    key: "apricot-lilac",
    name: "Apricot to Lilac",
    note: "Gradient. Warm into cool, the one people remember.",
    hue: 55,
    chromaScale: 0.62,
    gradientHue: 310,
  },
  {
    key: "apricot-rose",
    name: "Apricot to Rose",
    note: "Gradient. Sunrise, warm the whole way.",
    hue: 55,
    chromaScale: 0.62,
    gradientHue: 12,
  },
  {
    key: "apricot-mint",
    name: "Apricot to Mint",
    note: "Gradient. Keeps the colour you shipped at one end.",
    hue: 55,
    chromaScale: 0.62,
    gradientHue: 168,
  },
]

function toBlock(
  tokens: TokenTemplate[],
  candidate: PaletteCandidate,
): string[] {
  return tokens.map(([name, lightness, chroma, hueOffset]) => {
    const scaled = Math.round(chroma * candidate.chromaScale * 1000) / 1000
    return `  --${name}: oklch(${lightness} ${scaled} ${candidate.hue + hueOffset});`
  })
}

/**
 * A gradient fills the sweep and nothing else. --button-accent is also the hover border and
 * the shadow, and a gradient handed to either makes the whole declaration invalid rather
 * than falling back to anything, which is why the sweep has a variable of its own.
 */
function gradientLines(candidate: PaletteCandidate): string[] {
  if (candidate.gradientHue === undefined) return []

  const chroma = Math.round(0.125 * candidate.chromaScale * 1000) / 1000
  const from = `oklch(0.876 ${chroma} ${candidate.hue})`
  const to = `oklch(0.876 ${chroma} ${candidate.gradientHue})`

  return [`  --button-sweep: linear-gradient(96deg, ${from}, ${to});`]
}

/**
 * The whole override, as one stylesheet.
 *
 * Written as :root and .dark rather than set on the element itself, because the two themes
 * need different values and an inline style would pin one of them over both.
 */
export function paletteCss(candidate: PaletteCandidate): string {
  return [
    ":root {",
    ...toBlock(LIGHT_TOKENS, candidate),
    ...gradientLines(candidate),
    "}",
    ".dark {",
    ...toBlock(DARK_TOKENS, candidate),
    ...gradientLines(candidate),
    "}",
  ].join("\n")
}

export function findPaletteCandidate(
  key: string,
): PaletteCandidate | undefined {
  return PALETTE_CANDIDATES.find((candidate) => candidate.key === key)
}

/** Where the choice is kept. Per browser, never sent anywhere. */
export const PALETTE_STORAGE_KEY = "poli:palette-lab"

/** The id of the injected stylesheet, so applying twice replaces rather than stacks. */
export const PALETTE_STYLE_ID = "palette-lab"
