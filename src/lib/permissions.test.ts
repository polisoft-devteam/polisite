// These are the rules that keep private data private, so they are tested directly rather
// than through the UI.

import { describe, expect, it } from "vitest"

import type { Event, Member, Role } from "@/db/schema"
import {
  canBringGuests,
  canAwardBadges,
  canClaimWish,
  canCreateEvent,
  canDeactivateMember,
  canManageMembers,
  canEditEvent,
  canRemoveGuest,
  canRespondToEvent,
  canViewMemberDirectory,
  canViewEvent,
  isActiveMember,
  isAdmin,
  visibleEventVisibilitiesFor,
  type Viewer,
} from "@/lib/permissions"

function buildMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "member-1",
    authUserId: "auth-1",
    email: "member@example.com",
    fullName: "A Member",
    avatarUrl: null,
    nickname: null,
    officialTitle: null,
    bio: null,
    githubUrl: null,
    birthday: null,
    status: "active",
    joinedAssociationAt: new Date("2026-01-01"),
    notificationsSeenAt: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

function buildViewer(member: Member | null, roles: Role[] = []): Viewer {
  return {
    authUserId: "auth-1",
    googleName: null,
    googleAvatarUrl: null,
    email: "member@example.com",
    member,
    roles,
  }
}

function buildEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "event-1",
    title: "Bastufestival",
    description: null,
    slug: "test-event",
    kind: "confirmed",
    startsAt: new Date("2026-10-04T18:00:00Z"),
    endsAt: null,
    timeZone: "Europe/Stockholm",
    location: null,
    isOnline: false,
    category: "other",
    priceMinorUnits: null,
    priceCurrency: "SEK",
    maxAttendees: null,
    imageUrl: null,
    eventUrl: null,
    extraLinkUrl: null,
    visibility: "members",
    createdByMemberId: "member-1",
    discordAnnouncedAt: null,
    discordMessageId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

const signedOutVisitor = null
const signedInGuest = buildViewer(null)
const activeMember = buildViewer(buildMember(), ["member"])
const inactiveMember = buildViewer(buildMember({ status: "inactive" }), [
  "member",
])
const adminMember = buildViewer(
  buildMember({ id: "member-admin", email: "admin@example.com" }),
  ["member", "admin"],
)

describe("membership", () => {
  it("treats a signed-in guest as not a member", () => {
    expect(isActiveMember(signedInGuest)).toBe(false)
  })

  it("treats an inactive member as not a member", () => {
    expect(isActiveMember(inactiveMember)).toBe(false)
  })

  it("only grants admin to an active member holding the role", () => {
    expect(isAdmin(adminMember)).toBe(true)
    expect(isAdmin(activeMember)).toBe(false)
    expect(
      isAdmin(buildViewer(buildMember({ status: "inactive" }), ["admin"])),
    ).toBe(false)
  })
})

describe("managing members", () => {
  it("only admins may approve membership requests", () => {
    expect(canManageMembers(adminMember)).toBe(true)
    expect(canManageMembers(activeMember)).toBe(false)
    expect(canManageMembers(signedInGuest)).toBe(false)
    expect(canManageMembers(signedOutVisitor)).toBe(false)
  })

  it("refuses an inactive member even holding the admin role", () => {
    const formerAdmin = buildViewer(buildMember({ status: "inactive" }), [
      "member",
      "admin",
    ])

    expect(canManageMembers(formerAdmin)).toBe(false)
  })
})

describe("deactivating members", () => {
  const ordinaryMember = { id: "member-1", roles: ["member"] as Role[] }
  const anotherAdmin = {
    id: "member-other-admin",
    roles: ["member", "admin"] as Role[],
  }

  it("lets an admin deactivate an ordinary member", () => {
    expect(canDeactivateMember(adminMember, ordinaryMember)).toBe(true)
  })

  it("refuses to deactivate another admin", () => {
    expect(canDeactivateMember(adminMember, anotherAdmin)).toBe(false)
  })

  it("refuses to deactivate yourself, even as an admin", () => {
    expect(
      canDeactivateMember(adminMember, {
        id: "member-admin",
        roles: ["member", "admin"],
      }),
    ).toBe(false)
  })

  it("refuses a non-admin entirely", () => {
    expect(canDeactivateMember(activeMember, ordinaryMember)).toBe(false)
    expect(canDeactivateMember(signedInGuest, ordinaryMember)).toBe(false)
    expect(canDeactivateMember(signedOutVisitor, ordinaryMember)).toBe(false)
  })
})

describe("event visibility", () => {
  it("shows guests public events only", () => {
    expect(visibleEventVisibilitiesFor(signedOutVisitor)).toEqual(["public"])
    expect(visibleEventVisibilitiesFor(signedInGuest)).toEqual(["public"])
  })

  it("hides bring-a-friend events from guests, since only attendance is widened", () => {
    const friendsEvent = buildEvent({ visibility: "members_and_friends" })

    expect(canViewEvent(signedOutVisitor, friendsEvent)).toBe(false)
    expect(canViewEvent(signedInGuest, friendsEvent)).toBe(false)
    expect(canViewEvent(activeMember, friendsEvent)).toBe(true)
  })

  it("never exposes members-only events to a non-member", () => {
    const membersOnlyEvent = buildEvent({ visibility: "members" })

    expect(canViewEvent(signedOutVisitor, membersOnlyEvent)).toBe(false)
    expect(canViewEvent(signedInGuest, membersOnlyEvent)).toBe(false)
    expect(canViewEvent(inactiveMember, membersOnlyEvent)).toBe(false)
    expect(canViewEvent(activeMember, membersOnlyEvent)).toBe(true)
  })

  it("shows public events to everyone", () => {
    const publicEvent = buildEvent({ visibility: "public" })

    expect(canViewEvent(signedOutVisitor, publicEvent)).toBe(true)
    expect(canViewEvent(signedInGuest, publicEvent)).toBe(true)
    expect(canViewEvent(activeMember, publicEvent)).toBe(true)
  })
})

describe("event editing", () => {
  const eventByMemberOne = buildEvent({ createdByMemberId: "member-1" })

  it("lets the creator edit their own event", () => {
    expect(canEditEvent(activeMember, eventByMemberOne)).toBe(true)
  })

  it("stops another member editing someone else's event", () => {
    const otherMember = buildViewer(buildMember({ id: "member-2" }), ["member"])

    expect(canEditEvent(otherMember, eventByMemberOne)).toBe(false)
  })

  it("lets an admin edit anyone's event", () => {
    expect(canEditEvent(adminMember, eventByMemberOne)).toBe(true)
  })

  it("stops guests and inactive members editing anything", () => {
    expect(canEditEvent(signedOutVisitor, eventByMemberOne)).toBe(false)
    expect(canEditEvent(signedInGuest, eventByMemberOne)).toBe(false)
    expect(canEditEvent(inactiveMember, eventByMemberOne)).toBe(false)
  })
})

describe("creating and responding", () => {
  it("only lets active members create events", () => {
    expect(canCreateEvent(activeMember)).toBe(true)
    expect(canCreateEvent(signedInGuest)).toBe(false)
    expect(canCreateEvent(signedOutVisitor)).toBe(false)
  })

  it("lets a guest read a public event but not respond to it", () => {
    const publicEvent = buildEvent({ visibility: "public" })

    expect(canViewEvent(signedInGuest, publicEvent)).toBe(true)
    expect(canRespondToEvent(signedInGuest, publicEvent)).toBe(false)
  })
})

describe("canBringGuests", () => {
  const goingMember = buildViewer(buildMember())

  it("lets a member going to a public event bring someone", () => {
    const event = buildEvent({ visibility: "public" })
    expect(canBringGuests(goingMember, event, "going")).toBe(true)
  })

  it("lets a member going to a members-and-friends event bring someone", () => {
    const event = buildEvent({ visibility: "members_and_friends" })
    expect(canBringGuests(goingMember, event, "going")).toBe(true)
  })

  it("refuses on a members-only event — there is nobody to bring", () => {
    const event = buildEvent({ visibility: "members" })
    expect(canBringGuests(goingMember, event, "going")).toBe(false)
  })

  it("refuses unless the member is going themselves", () => {
    const event = buildEvent({ visibility: "public" })
    expect(canBringGuests(goingMember, event, "interested")).toBe(false)
    expect(canBringGuests(goingMember, event, "not_going")).toBe(false)
    expect(canBringGuests(goingMember, event, null)).toBe(false)
  })

  it("refuses a signed-in guest and a signed-out visitor", () => {
    const event = buildEvent({ visibility: "public" })
    expect(canBringGuests(buildViewer(null), event, "going")).toBe(false)
    expect(canBringGuests(null, event, "going")).toBe(false)
  })

  it("refuses an inactive member", () => {
    const inactive = buildViewer(buildMember({ status: "inactive" }))
    const event = buildEvent({ visibility: "public" })
    expect(canBringGuests(inactive, event, "going")).toBe(false)
  })
})

describe("canRemoveGuest", () => {
  it("lets a member remove someone they brought", () => {
    const viewer = buildViewer(buildMember())
    expect(canRemoveGuest(viewer, { invitedByMemberId: "member-1" })).toBe(true)
  })

  it("refuses removing someone another member brought", () => {
    const viewer = buildViewer(buildMember())
    expect(canRemoveGuest(viewer, { invitedByMemberId: "member-2" })).toBe(
      false,
    )
  })

  it("lets an admin tidy up after anyone", () => {
    const admin = buildViewer(buildMember(), ["admin"])
    expect(canRemoveGuest(admin, { invitedByMemberId: "member-2" })).toBe(true)
  })

  it("refuses a signed-out visitor", () => {
    expect(canRemoveGuest(null, { invitedByMemberId: "member-1" })).toBe(false)
  })
})

describe("wishlist claiming", () => {
  const me = buildMember({ id: "me" })
  const someoneElse = buildMember({ id: "them" })

  it("lets a member claim someone else's wish", () => {
    expect(canClaimWish(buildViewer(me), someoneElse.id)).toBe(true)
  })

  it("refuses to let a member claim their own wish", () => {
    // Claiming your own would tell you a claim exists, which is the one thing the owner
    // must never learn about their own list.
    expect(canClaimWish(buildViewer(me), me.id)).toBe(false)
  })

  it("refuses a guest and a signed-out visitor", () => {
    const guest = buildViewer(buildMember({ id: "guest", status: "inactive" }))

    expect(canClaimWish(guest, someoneElse.id)).toBe(false)
    expect(canClaimWish(null, someoneElse.id)).toBe(false)
  })
})

describe("member directory", () => {
  it("is for members, not guests", () => {
    expect(canViewMemberDirectory(buildViewer(buildMember()))).toBe(true)
    expect(
      canViewMemberDirectory(buildViewer(buildMember({ status: "inactive" }))),
    ).toBe(false)
    expect(canViewMemberDirectory(null)).toBe(false)
  })
})

describe("awarding badges and offices", () => {
  it("is for admins only", () => {
    const admin = buildViewer(buildMember(), ["member", "admin"])
    const member = buildViewer(buildMember(), ["member"])

    expect(canAwardBadges(admin)).toBe(true)
    expect(canAwardBadges(member)).toBe(false)
    expect(canAwardBadges(null)).toBe(false)
  })
})
