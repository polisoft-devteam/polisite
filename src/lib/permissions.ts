// Every access rule in the app. If you cannot answer "who can see this?" by reading this
// file, something is in the wrong place.
//
// These are plain functions over plain data so they can be tested without a database.

import type {
  AttendanceResponse,
  Event,
  EventVisibility,
  Member,
  Role,
} from "@/db/schema"

/** What a permission check needs to know about the person looking. */
export type Viewer = {
  authUserId: string
  email: string
  /** From the Google account, before they have a member row of their own. */
  googleName: string | null
  googleAvatarUrl: string | null
  /** Null for a signed-in guest — a Google account with no membership. */
  member: Member | null
  roles: Role[]
}

export function isActiveMember(viewer: Viewer | null): boolean {
  return viewer?.member?.status === "active"
}

export function isAdmin(viewer: Viewer | null): boolean {
  return isActiveMember(viewer) && (viewer?.roles.includes("admin") ?? false)
}

/** Approving members, and anything else on the admin pages. */
export function canManageMembers(viewer: Viewer | null): boolean {
  return isAdmin(viewer)
}

/** Just enough about the person being acted on to decide. */
export type ManageableMember = {
  id: string
  roles: Role[]
}

/**
 * Admins can deactivate ordinary members, and nobody else.
 *
 * Two exclusions, both about not being able to undo the result: deactivating yourself
 * locks you out of the admin page, and admins can't demote each other — so removing the
 * last one takes a deliberate trip to the database.
 */
export function canDeactivateMember(
  viewer: Viewer | null,
  target: ManageableMember,
): boolean {
  if (!canManageMembers(viewer)) return false
  if (target.id === viewer?.member?.id) return false
  if (target.roles.includes("admin")) return false

  return true
}

/**
 * Which event visibilities this viewer may see at all.
 *
 * Used to filter in the query. Never fetch everything and hide rows in the component —
 * that ships private data to the browser and only pretends to hide it.
 */
export function visibleEventVisibilitiesFor(
  viewer: Viewer | null,
): EventVisibility[] {
  // "members_and_friends" is about who may come along, not who may read the page — a
  // guest still doesn't see it.
  return isActiveMember(viewer)
    ? ["public", "members", "members_and_friends"]
    : ["public"]
}

export function canViewEvent(viewer: Viewer | null, event: Event): boolean {
  return visibleEventVisibilitiesFor(viewer).includes(event.visibility)
}

export function canCreateEvent(viewer: Viewer | null): boolean {
  return isActiveMember(viewer)
}

/** The creator keeps control of their own event; admins can fix anyone's. */
export function canEditEvent(viewer: Viewer | null, event: Event): boolean {
  if (!isActiveMember(viewer)) return false
  return event.createdByMemberId === viewer!.member!.id || isAdmin(viewer)
}

export function canDeleteEvent(viewer: Viewer | null, event: Event): boolean {
  return canEditEvent(viewer, event)
}

/** Guests can read a public event but cannot say they're coming. */
export function canRespondToEvent(
  viewer: Viewer | null,
  event: Event,
): boolean {
  return isActiveMember(viewer) && canViewEvent(viewer, event)
}

/**
 * Bringing a friend along needs three things: you're a member, you're going yourself, and
 * the event isn't the members-only kind — "members" means us for us, so there is nobody
 * to bring.
 */
export function canBringGuests(
  viewer: Viewer | null,
  event: Event,
  myResponse: AttendanceResponse | null,
): boolean {
  if (!canRespondToEvent(viewer, event)) return false

  // Whoever made the event keeps the guest list whatever its visibility, and without
  // having to answer for themselves first: they are counting heads, not bringing a date.
  if (canEditEvent(viewer, event)) return true

  if (event.visibility === "members") return false

  return myResponse === "going"
}

/** Just enough about a brought-along guest to decide. */
export type RemovableGuest = {
  invitedByMemberId: string
}

/** You can take off the people you brought; admins can tidy up after anyone. */
export function canRemoveGuest(
  viewer: Viewer | null,
  guest: RemovableGuest,
): boolean {
  if (!isActiveMember(viewer)) return false

  return guest.invitedByMemberId === viewer!.member!.id || isAdmin(viewer)
}

// --- Wishlist ------------------------------------------------------------------

/** Any active member keeps a wishlist, and only their own. */
export function canEditOwnWishlist(viewer: Viewer | null): boolean {
  return isActiveMember(viewer)
}

/**
 * You may claim anyone's wish but your own.
 *
 * Claiming your own would tell you a claim exists, which is exactly what the owner must
 * never learn. The queries already leave claims out of an owner's list; this stops the
 * action being called directly with your own item id.
 */
export function canClaimWish(
  viewer: Viewer | null,
  ownerMemberId: string,
): boolean {
  if (!isActiveMember(viewer)) return false

  return viewer!.member!.id !== ownerMemberId
}

/** Members can see each other. A guest sees no one. */
export function canViewMemberDirectory(viewer: Viewer | null): boolean {
  return isActiveMember(viewer)
}

// --- Badges and titles ---------------------------------------------------------

/**
 * Only an admin awards a badge or sets an office.
 *
 * Both are display labels and grant nothing, but they are statements the association
 * makes about a member, so they are not for the member to make about themselves.
 */
export function canAwardBadges(viewer: Viewer | null): boolean {
  return isAdmin(viewer)
}
