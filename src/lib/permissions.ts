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

/**
 * Which visibilities this viewer may actually open, as opposed to merely see listed.
 *
 * A member reads everything they can see. Somebody signed in with Google but not yet a
 * member reads the public ones and answers them: a public event is the association saying
 * "come along", and a page nobody outside can open is a poor way to say it. A visitor who
 * has not signed in reads none of them, so a slug guessed from a Discord link tells them
 * nothing.
 *
 * Kept apart from visibleEventVisibilitiesFor because seeing that an evening exists and
 * reading where it is are different questions with different answers.
 */
export function openableEventVisibilitiesFor(
  viewer: Viewer | null,
): EventVisibility[] {
  if (isActiveMember(viewer)) return visibleEventVisibilitiesFor(viewer)

  return viewer ? ["public"] : []
}

export function canOpenEvent(viewer: Viewer | null, event: Event): boolean {
  return openableEventVisibilitiesFor(viewer).includes(event.visibility)
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

/**
 * Answering needs an account, and an event you may open.
 *
 * So a guest may say they are coming to a public event, which is the point of a public
 * event, and nobody who has not signed in may answer anything: an attendee list is a list
 * of people, and a name on it has to belong to somebody.
 */
export function canRespondToEvent(
  viewer: Viewer | null,
  event: Event,
): boolean {
  return canOpenEvent(viewer, event)
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
  // Members only, even where a guest may answer for themselves: bringing somebody else is
  // vouching for them, and that is a member's to do.
  if (!isActiveMember(viewer)) return false
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

// --- The election wheel --------------------------------------------------------

/**
 * Anyone may spin; only a member's result is written down.
 *
 * A visitor has no member row to hang it on, and the results page is a page about the
 * association rather than about whoever happened to pass by.
 */
export function canRecordElectionPick(viewer: Viewer | null): boolean {
  return isActiveMember(viewer)
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

/**
 * Who may see the association's faces: anyone signed in, member or not.
 *
 * Somebody whose request is with an admin is already half here, and a list of names is a
 * poor thing to make them wait for. A visitor who has not signed in still sees nobody.
 */
export function canViewMemberDirectory(viewer: Viewer | null): boolean {
  return viewer !== null
}

// --- The open archive ----------------------------------------------------------

/**
 * Any member may add to the archive. It is the association's own scrapbook, and asking an
 * admin to paste a link on your behalf would mean it stopped being kept.
 */
export function canAddArchiveLink(viewer: Viewer | null): boolean {
  return isActiveMember(viewer)
}

/** Whoever put it there can change it, and an admin can fix anyone's. */
export function canEditArchiveLink(
  viewer: Viewer | null,
  link: { addedByMemberId: string | null },
): boolean {
  if (!isActiveMember(viewer)) return false
  return link.addedByMemberId === viewer!.member!.id || isAdmin(viewer)
}

/** The same answer as editing: whoever may correct it may also take it away. */
export function canRemoveArchiveLink(
  viewer: Viewer | null,
  link: { addedByMemberId: string | null },
): boolean {
  return canEditArchiveLink(viewer, link)
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
