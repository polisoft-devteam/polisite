import { isElectionOpen } from "@/lib/election"

/**
 * Main navigation. Kept in one place so adding a section means editing one array.
 * `translationKey` is looked up under "Nav" in messages/*.json — the label itself
 * is translated, never written here.
 * Member-only links are added here in Phase 1, once membership exists to check.
 */
export type NavigationLink = {
  href: "/" | "/events" | "/calendar" | "/archive" | "/about" | "/election"
  translationKey:
    "home" | "events" | "calendar" | "archive" | "about" | "election"
}

/** Every link the navigation can hold, in the order it holds them. */
export const ALL_NAVIGATION_LINKS: NavigationLink[] = [
  { href: "/", translationKey: "home" },
  { href: "/events", translationKey: "events" },
  { href: "/calendar", translationKey: "calendar" },
  { href: "/election", translationKey: "election" },
  { href: "/archive", translationKey: "archive" },
  { href: "/about", translationKey: "about" },
]

/**
 * The navigation as it stands today.
 *
 * Val 2026 is in it only while the election is on, and then leaves on its own: a link to
 * a finished election is a link nobody wants, and taking it out should not depend on
 * anyone remembering to.
 */
export function navigationLinks(): NavigationLink[] {
  return ALL_NAVIGATION_LINKS.filter(
    (navigationLink) => navigationLink.href !== "/election" || isElectionOpen(),
  )
}

/**
 * Shared by the desktop bar and the mobile menu, so "you are here" can't drift between
 * them. Home only matches exactly — startsWith would light it up on every page.
 */
export function isCurrentNavigationLink(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href)
}
