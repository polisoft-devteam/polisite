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
  /**
   * The stops a gradient candidate's buttons fill with, first to last.
   *
   * Each carries its own chroma rather than sharing the palette's, because how much colour
   * a hue can hold at this lightness varies wildly: mint reaches 0.125 and a blue manages
   * 0.063. One scale across a three stop gradient would flatten whichever end could not
   * take it.
   */
  gradientStops?: GradientStop[]
}

/**
 * A stop: its hue, and the chroma that hue can hold at each of the two lightnesses the
 * palette uses. A gradient filling a button and the same gradient set as text are not the
 * same colours: the fill is pale enough to carry a near-black label, and pale enough to be
 * 1.4:1 as text, which is no text at all.
 */
type GradientStop = readonly [
  hue: number,
  fillChroma: number,
  inkChroma: number,
]

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
    note: "Warm into cool. The one people remember.",
    hue: 55,
    chromaScale: 0.62,
    gradientStops: [
      [55, 0.077, 0.11],
      [310, 0.082, 0.11],
    ],
  },
  {
    key: "apricot-rose",
    name: "Apricot to Rose",
    note: "Sunrise. Warm the whole way.",
    hue: 55,
    chromaScale: 0.62,
    gradientStops: [
      [55, 0.077, 0.11],
      [12, 0.067, 0.11],
    ],
  },
  {
    key: "apricot-mint",
    name: "Apricot to Mint",
    note: "Keeps the colour you shipped at one end.",
    hue: 55,
    chromaScale: 0.62,
    gradientStops: [
      [55, 0.077, 0.11],
      [168, 0.125, 0.102],
    ],
  },

  // Two stops.
  {
    key: "fizz",
    name: "Fizz",
    note: "Blue into pink. Cold start, sweet finish.",
    hue: 250,
    chromaScale: 0.5,
    gradientStops: [
      [250, 0.063, 0.11],
      [345, 0.083, 0.11],
    ],
  },
  {
    key: "lagoon",
    name: "Lagoon",
    note: "Teal into violet. Cool the whole way, and the deepest of them.",
    hue: 190,
    chromaScale: 1,
    gradientStops: [
      [190, 0.125, 0.087],
      [295, 0.068, 0.11],
    ],
  },
  {
    key: "meadow",
    name: "Meadow",
    note: "Green into sky. Reads outdoors rather than digital.",
    hue: 135,
    chromaScale: 1,
    gradientStops: [
      [135, 0.125, 0.11],
      [235, 0.071, 0.108],
    ],
  },

  // Three stops. The middle one is what stops a gradient reading as a single wash.
  {
    key: "sunset",
    name: "Sunset",
    note: "Gold, coral, violet. The full evening.",
    hue: 85,
    chromaScale: 1,
    gradientStops: [
      [85, 0.125, 0.104],
      [25, 0.066, 0.11],
      [300, 0.071, 0.11],
    ],
  },
  {
    key: "aurora",
    name: "Aurora",
    note: "The mint you shipped, drifting through sky into lilac.",
    hue: 168,
    chromaScale: 1,
    gradientStops: [
      [168, 0.125, 0.102],
      [235, 0.071, 0.108],
      [300, 0.071, 0.11],
    ],
  },
  {
    key: "sherbet",
    name: "Sherbet",
    note: "Pink, apricot, lime. Loudest of the lot.",
    hue: 345,
    chromaScale: 0.66,
    gradientStops: [
      [345, 0.083, 0.11],
      [55, 0.077, 0.11],
      [120, 0.125, 0.11],
    ],
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
function gradientLines(candidate: PaletteCandidate, dark: boolean): string[] {
  if (!candidate.gradientStops) return []

  const fill = gradientFor(candidate)

  const stops = dark
    ? brandStopsFor(candidate, 0.876, (stop) => stop[1])
    : brandStopsFor(candidate, 0.5, (stop) => stop[2])

  return [
    `  --button-sweep: ${fill};`,
    `  --brand-sweep-ink: ${dark ? fill : inkGradientFor(candidate)};`,
    // What turns the letters over to the gradient. Unset on a solid palette, where the
    // wordmark keeps its own colour; see .brand-text in globals.css.
    "  --brand-text-fill: transparent;",
    ...(stops ?? []).map(
      (colour, index) => `  --brand-stop-${index + 1}: ${colour};`,
    ),
    // Points an icon's fill at the gradient in BrandGradientDefs. Unset on a solid
    // palette, where the icon falls back to currentColor and looks as it always did.
    "  --brand-icon-fill: url(#brand-gradient);",
  ]
}

function gradientAt(
  candidate: PaletteCandidate,
  lightness: number,
  pick: (stop: GradientStop) => number,
): string | null {
  if (!candidate.gradientStops) return null

  const stops = candidate.gradientStops
    .map((stop) => `oklch(${lightness} ${pick(stop)} ${stop[0]})`)
    .join(", ")

  return `linear-gradient(96deg, ${stops})`
}

/** What a button fills with. Also the swatch, so the lab cannot advertise the wrong thing. */
export function gradientFor(candidate: PaletteCandidate): string | null {
  return gradientAt(candidate, 0.876, (stop) => stop[1])
}

/**
 * The stops on their own, for the one place a CSS gradient cannot reach: the inside of an
 * SVG. An icon is filled by referencing a <linearGradient>, which needs its colours as
 * three separate stops rather than as one background shorthand.
 *
 * Always three. A two colour palette mixes its own middle, because the gradient in the
 * defs has a fixed number of stops and cannot grow one when the palette changes.
 */
export function brandStopsFor(
  candidate: PaletteCandidate,
  lightness: number,
  pick: (stop: GradientStop) => number,
): string[] | null {
  if (!candidate.gradientStops) return null

  const colours = candidate.gradientStops.map(
    (stop) => `oklch(${lightness} ${pick(stop)} ${stop[0]})`,
  )

  if (colours.length >= 3) return colours.slice(0, 3)

  return [
    colours[0],
    `color-mix(in oklch, ${colours[0]}, ${colours[1]})`,
    colours[1],
  ]
}

/**
 * The same gradient as text on a page. Darker, because the fill is 1.4:1 on white and a
 * wordmark nobody can read is not a wordmark. In dark mode the two are the same, which is
 * exactly how --primary-ink already behaves.
 */
export function inkGradientFor(candidate: PaletteCandidate): string | null {
  return gradientAt(candidate, 0.5, (stop) => stop[2])
}

/** The solid fill, for a candidate that is not a gradient. */
export function fillFor(candidate: PaletteCandidate): string {
  const chroma = Math.round(0.125 * candidate.chromaScale * 1000) / 1000
  return `oklch(0.876 ${chroma} ${candidate.hue})`
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
    ...gradientLines(candidate, false),
    "}",
    ".dark {",
    ...toBlock(DARK_TOKENS, candidate),
    ...gradientLines(candidate, true),
    "}",
  ].join("\n")
}

/**
 * The four offered in the header. The rest are for trying things on /design: fifteen is a
 * lot of choice for ten people, and every member seeing a different site makes "the button
 * looks wrong" a question nobody can answer.
 */
export const USER_PALETTE_KEYS = [
  "aurora",
  "apricot-mint",
  "fizz",
  "sherbet",
] as const

export function userPalettes(): PaletteCandidate[] {
  return USER_PALETTE_KEYS.map((key) =>
    PALETTE_CANDIDATES.find((candidate) => candidate.key === key)!,
  )
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
