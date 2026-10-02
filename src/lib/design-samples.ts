// Stand-in data for /design, so components that normally need the database can be shown
// there. Nothing here is ever written — it exists to be rendered and looked at.
//
// The ids are real uuids, even though nothing looks them up. A component given a sample
// event may still go and ask the database who is coming, and Postgres refuses a uuid
// column an id shaped like "sample-event" rather than politely finding nothing. Version 4,
// all zeroes but the last digit, so one is never mistaken for a row that matters.

import type { Attendee, EventGuestWithInviter } from "@/features/events/queries"
import type { Event, Member } from "@/db/schema"
import type { CompetVote, CurrentCompetition } from "@/features/compet/queries"

export function buildSampleEvent(overrides: Partial<Event> = {}): Event {
  return {
    id: "00000000-0000-4000-8000-000000000001",
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
    spotifyUrl: null,
    visibility: "members_and_friends",
    createdByMemberId: "sample-member",
    cancelledAt: null,
    discordAnnouncedAt: null,
    discordMessageId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    ...overrides,
  }
}

export function buildSampleMember(overrides: Partial<Member> = {}): Member {
  return {
    id: "00000000-0000-4000-8000-000000000002",
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
    displayedBadge: null,
    createdAt: new Date("2019-06-01"),
    updatedAt: new Date("2019-06-01"),
    ...overrides,
  }
}

export const SAMPLE_ATTENDEES: Attendee[] = [
  {
    memberId: "00000000-0000-4000-8000-000000000011",
    fullName: "Astrid Lindqvist",
    nickname: "Assi",
    email: "sample@example.com",
    avatarUrl: null,
    displayedBadge: "poli",
    displayedBadgeTier: null,
    response: "going",
  },
  {
    memberId: "00000000-0000-4000-8000-000000000012",
    fullName: "Bengt Karlsson",
    nickname: null,
    email: "sample@example.com",
    avatarUrl: null,
    displayedBadge: "poli",
    displayedBadgeTier: null,
    response: "going",
  },
  {
    memberId: "00000000-0000-4000-8000-000000000013",
    fullName: "Cecilia Ohlsson",
    nickname: null,
    email: "sample@example.com",
    avatarUrl: null,
    displayedBadge: "poli",
    displayedBadgeTier: null,
    response: "going",
  },
]

export const SAMPLE_GUESTS: EventGuestWithInviter[] = [
  {
    id: "00000000-0000-4000-8000-000000000021",
    name: "Doris Almqvist",
    invitedByMemberId: "00000000-0000-4000-8000-000000000011",
    invitedByName: "Astrid Lindqvist",
  },
  {
    id: "00000000-0000-4000-8000-000000000022",
    name: "Erik Sund",
    invitedByMemberId: "00000000-0000-4000-8000-000000000012",
    invitedByName: "Bengt Karlsson",
  },
]

export const SAMPLE_COMPETITION: CurrentCompetition = {
  id: "00000000-0000-4000-8000-000000000020",
  question: "Vem är bäst på hockey?",
  left: {
    memberId: "00000000-0000-4000-8000-000000000021",
    displayName: "Adam",
    avatarUrl: null,
    bannerUrl: null,
  },
  right: {
    memberId: "00000000-0000-4000-8000-000000000022",
    displayName: "Bertil",
    avatarUrl: null,
    bannerUrl: null,
  },
}

export const SAMPLE_COMPETITION_VOTES: CompetVote[] = [
  {
    id: "00000000-0000-4000-8000-000000000023",
    voterMemberId: "00000000-0000-4000-8000-000000000026",
    votedForMemberId: SAMPLE_COMPETITION.left.memberId,
    reason: "Snabbast på skridskor",
    createdAt: new Date("2026-10-02T12:00:00Z"),
    voter: { displayName: "Cecilia", avatarUrl: null },
  },
  {
    id: "00000000-0000-4000-8000-000000000024",
    voterMemberId: "00000000-0000-4000-8000-000000000027",
    votedForMemberId: SAMPLE_COMPETITION.left.memberId,
    reason: "Har aldrig förlorat en tackling",
    createdAt: new Date("2026-10-02T11:58:00Z"),
    voter: { displayName: "David", avatarUrl: null },
  },
  {
    id: "00000000-0000-4000-8000-000000000025",
    voterMemberId: "00000000-0000-4000-8000-000000000028",
    votedForMemberId: SAMPLE_COMPETITION.right.memberId,
    reason: "Bättre klubba",
    createdAt: new Date("2026-10-02T11:55:00Z"),
    voter: { displayName: "Erik", avatarUrl: null },
  },
]
