// The offices a member can hold.
//
// A fixed list rather than free text: a title says something about the association, so it
// is given by an admin rather than typed by whoever fancies it. Kept here rather than as a
// database enum, so adding one is an edit and a translation, not a migration.
//
// These are display labels and grant nothing. Permissions live in permissions.ts.

export const MEMBER_TITLES = [
  "president",
  "secretary",
  "legalCounsel",
  "photographer",
  "peopleAndCulture",
  "animalsAndVape",
  "safety",
] as const

export type MemberTitle = (typeof MEMBER_TITLES)[number]

export function isMemberTitle(value: string): value is MemberTitle {
  return (MEMBER_TITLES as readonly string[]).includes(value)
}
