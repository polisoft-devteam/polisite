// The association's history, oldest first.
//
// Structure lives here; the words live in messages/*.json under About.timeline, keyed by
// id — so an image path isn't duplicated across two language files where it could drift.
//
// The text is placeholder. Replace it with what actually happened.

export type TimelineEntry = {
  id: string
  year: string
  /** Optional: entries without a photo are text only, which keeps the rhythm varied. */
  imageUrl?: string
}

export const ASSOCIATION_TIMELINE: TimelineEntry[] = [
  { id: "before", year: "Före" },
  { id: "founding", year: "2019", imageUrl: "/images/wide_poli_meet.webp" },
  { id: "firstTrip", year: "2021" },
  { id: "football", year: "2023", imageUrl: "/images/tall_fotball_fest.webp" },
  { id: "formalised", year: "2025" },
  { id: "today", year: "Nu" },
]
