// The election wheel: who is on it, when it goes away, and where a spin is remembered.
//
// It is a gimmick for the 2026 riksdag election, not part of the association's data. The
// party you land on is kept in your own browser and sent nowhere, so there is no column,
// no migration and nothing for anyone else to read.
//
// Party colours are literals rather than tokens on purpose: a party's colour is its
// identity, not this site's theme, and re-theming the site must not repaint them. They are
// softened towards white, so twelve of them side by side on a wheel read as a fairground
// rather than as a shouting match, and each carries a dark version of its own hue for text.
//
// Where a spin is remembered is chosen-party.ts: that half is browser only, and this half
// is read on the server too.

export type Party = {
  key: string
  name: string
  abbreviation: string
  /** The party's colour, softened. */
  color: string
  /** The same hue darkened, so a label stays readable on it. */
  textColor: string
}

export const SWEDISH_PARTIES: Party[] = [
  {
    key: "s",
    name: "Socialdemokraterna",
    abbreviation: "S",
    color: "#f6a5af",
    textColor: "#610713",
  },
  {
    key: "m",
    name: "Moderaterna",
    abbreviation: "M",
    color: "#bde6f8",
    textColor: "#224f63",
  },
  {
    key: "sd",
    name: "Sverigedemokraterna",
    abbreviation: "SD",
    color: "#fef29f",
    textColor: "#6a5c01",
  },
  {
    key: "c",
    name: "Centerpartiet",
    abbreviation: "C",
    color: "#9ed8b1",
    textColor: "#004015",
  },
  {
    key: "v",
    name: "Vänsterpartiet",
    abbreviation: "V",
    color: "#e19e9e",
    textColor: "#4a0000",
  },
  {
    key: "kd",
    name: "Kristdemokraterna",
    abbreviation: "KD",
    color: "#aba8cb",
    textColor: "#0f0a32",
  },
  {
    key: "mp",
    name: "Miljöpartiet",
    abbreviation: "MP",
    color: "#d0edb4",
    textColor: "#375718",
  },
  {
    key: "l",
    name: "Liberalerna",
    abbreviation: "L",
    color: "#9ec6e2",
    textColor: "#002d4b",
  },
  {
    key: "fi",
    name: "Feministiskt initiativ",
    abbreviation: "Fi",
    color: "#f69ece",
    textColor: "#610035",
  },
  {
    key: "pp",
    name: "Piratpartiet",
    abbreviation: "PP",
    color: "#bfaed1",
    textColor: "#251238",
  },
  {
    key: "afs",
    name: "Alternativ för Sverige",
    abbreviation: "AfS",
    color: "#aab4c2",
    textColor: "#0d1828",
  },
  {
    key: "med",
    name: "Medborgerlig Samling",
    abbreviation: "MED",
    color: "#aebbd4",
    textColor: "#12203b",
  },
  {
    key: "nyans",
    name: "Partiet Nyans",
    abbreviation: "NYANS",
    color: "#9ed8d8",
    textColor: "#004040",
  },
  {
    key: "k",
    name: "Kommunistiska Partiet",
    abbreviation: "K",
    color: "#f6caa3",
    textColor: "#613005",
  },
]

// A handful and the ballot is closed: an infinite wheel is not a result, it is a menu.
// A passer by gets one, and signing in is worth two more.
export const SPINS_SIGNED_OUT = 1
export const SPINS_SIGNED_IN = 3

export function findParty(key: string): Party | null {
  return SWEDISH_PARTIES.find((party) => party.key === key) ?? null
}

// Midnight after election day in Stockholm, written as the UTC instant it is: the summer
// offset is +2. Date arithmetic here would count in the machine's timezone.
const ELECTION_ENDS_AT = Date.parse("2026-09-13T22:00:00Z")

/** The wheel, the tag and the short form after your name all end with the election. */
export function isElectionOpen(now: Date = new Date()): boolean {
  return now.getTime() < ELECTION_ENDS_AT
}
