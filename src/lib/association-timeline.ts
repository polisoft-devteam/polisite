// The association's history, oldest first.
//
// Structure lives here; the words live in messages/*.json under About.timeline, keyed by
// id — so an image path isn't duplicated across two language files where it could drift.
//
// The text and the photo choices are placeholder. Replace them with what actually happened.

export type TimelineEntry = {
  id: string
  year: string
  /**
   * Up to three. The first is the large one; any others stack on top of it, offset and
   * tilted. More than three and the pile stops reading as a pile.
   */
  images?: string[]
}

const MEET = "/images/wide_poli_meet.webp"
const FOOTBALL = "/images/tall_fotball_fest.webp"

export const ASSOCIATION_TIMELINE: TimelineEntry[] = [
  { id: "before", year: "Före" },
  { id: "founding", year: "2019", images: [MEET, FOOTBALL] },
  { id: "firstTrip", year: "2021" },
  { id: "football", year: "2023", images: [FOOTBALL, MEET, FOOTBALL] },
  { id: "formalised", year: "2025" },
  { id: "today", year: "Nu", images: [MEET] },
]
