// These are the rules that keep private data private, so they are tested directly rather
// than through the UI.

import { describe, expect, it } from "vitest"

import type { Event, Member, Role } from "@/db/schema"
import {
  canCreateEvent,
  canEditEvent,
  canRespondToEvent,
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
    funTitle: null,
    bio: null,
    birthday: null,
    status: "active",
    joinedAssociationAt: new Date("2026-01-01"),
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

function buildViewer(member: Member | null, roles: Role[] = []): Viewer {
  return {
    authUserId: "auth-1",
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
    startsAt: new Date("2026-10-04T18:00:00Z"),
    endsAt: null,
    timeZone: "Europe/Stockholm",
    location: null,
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
