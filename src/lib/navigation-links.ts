/**
 * Main navigation. Kept in one place so adding a section means editing one array.
 * `translationKey` is looked up under "Nav" in messages/*.json — the label itself
 * is translated, never written here.
 * Member-only links are added here in Phase 1, once membership exists to check.
 */
export type NavigationLink = {
  href: "/" | "/events" | "/calendar" | "/about"
  translationKey: "home" | "events" | "calendar" | "about"
}

export const mainNavigationLinks: NavigationLink[] = [
  { href: "/", translationKey: "home" },
  { href: "/events", translationKey: "events" },
  { href: "/calendar", translationKey: "calendar" },
  { href: "/about", translationKey: "about" },
]
