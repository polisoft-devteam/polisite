// Stand-in data for /design, so components that normally need the database can be shown
// there. Nothing here is ever written — it exists to be rendered and looked at.

import type { Attendee, EventGuestWithInviter } from "@/features/events/queries"
import type { Event, Member } from "@/db/schema"

export function buildSampleEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "sample-event",
    title: "Bastufestival i Hälsingland",
    description: "Två dagar bastu, bad och alldeles för mycket korv.",
    slug: "sample-event",
    kind: "confirmed",
    startsAt: new Date("2026-10-04T16:00:00Z"),
    endsAt: null,
    timeZone: "Europe/Stockholm",
    location: "Järvsö",
    isOnline: false,
    category: "trip",
    priceMinorUnits: 25000,
    priceCurrency: "SEK",
    maxAttendees: null,
    imageUrl: null,
    eventUrl: null,
    extraLinkUrl: null,
    visibility: "members_and_friends",
    createdByMemberId: "sample-member",
    discordAnnouncedAt: null,
    discordMessageId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

export function buildSampleMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "sample-member",
    authUserId: null,
    email: "medlem@example.com",
    fullName: "Astrid Lindqvist",
    avatarUrl: null,
    nickname: "Assi",
    officialTitle: "Sekreterare",
    bio: "Gillar långa vandringar och korta möten.",
    githubUrl: "https://github.com/polisoft-devteam",
    birthday: "1991-04-17",
    status: "active",
    joinedAssociationAt: new Date("2019-06-01"),
    notificationsSeenAt: null,
    lastBirthdayGreetingYear: null,
    createdAt: new Date("2019-06-01"),
    updatedAt: new Date("2019-06-01"),
    ...overrides,
  }
}

export const SAMPLE_ATTENDEES: Attendee[] = [
  {
    memberId: "m1",
    fullName: "Astrid Lindqvist",
    nickname: "Assi",
    avatarUrl: null,
    response: "going",
  },
  {
    memberId: "m2",
    fullName: "Bengt Karlsson",
    nickname: null,
    avatarUrl: null,
    response: "going",
  },
  {
    memberId: "m3",
    fullName: "Cecilia Ohlsson",
    nickname: null,
    avatarUrl: null,
    response: "going",
  },
]

export const SAMPLE_GUESTS: EventGuestWithInviter[] = [
  {
    id: "g1",
    name: "Doris Almqvist",
    invitedByMemberId: "m1",
    invitedByName: "Astrid Lindqvist",
  },
  {
    id: "g2",
    name: "Erik Sund",
    invitedByMemberId: "m2",
    invitedByName: "Bengt Karlsson",
  },
]
