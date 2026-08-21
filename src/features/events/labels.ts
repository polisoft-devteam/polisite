// One home for every event enum's display label and icon.
//
// These were duplicated across four files, which is how a category ends up looking
// different depending on which page you're on.
// Translation keys point into the "Events" namespace in messages/*.json.

import type {
  AttendanceResponse,
  EventCategory,
  EventVisibility,
  ReminderOffset,
} from "@/db/schema"
import {
  BirthdayIcon,
  BoardMeetingIcon,
  FoodIcon,
  HikeIcon,
  MusicIcon,
  OtherEventIcon,
  PartyIcon,
  SportIcon,
  TripIcon,
  type IconComponent,
} from "@/lib/icons"

export const EVENT_CATEGORY_ICON: Record<EventCategory, IconComponent> = {
  music: MusicIcon,
  party: PartyIcon,
  trip: TripIcon,
  hike: HikeIcon,
  sport: SportIcon,
  food: FoodIcon,
  board_meeting: BoardMeetingIcon,
  birthday: BirthdayIcon,
  other: OtherEventIcon,
}

export const EVENT_CATEGORY_LABEL_KEY: Record<EventCategory, string> = {
  music: "categoryMusic",
  party: "categoryParty",
  trip: "categoryTrip",
  hike: "categoryHike",
  sport: "categorySport",
  food: "categoryFood",
  board_meeting: "categoryBoardMeeting",
  birthday: "categoryBirthday",
  other: "categoryOther",
}

export const EVENT_VISIBILITY_LABEL_KEY: Record<EventVisibility, string> = {
  public: "visibilityPublic",
  members: "visibilityMembers",
  members_and_friends: "visibilityMembersAndFriends",
}

export const EVENT_VISIBILITY_EXPLANATION_KEY: Record<EventVisibility, string> =
  {
    public: "visibilityPublicExplanation",
    members: "visibilityMembersExplanation",
    members_and_friends: "visibilityMembersAndFriendsExplanation",
  }

export const REMINDER_OFFSET_LABEL_KEY: Record<ReminderOffset, string> = {
  day_before: "reminderDayBefore",
  week_before: "reminderWeekBefore",
  four_weeks_before: "reminderFourWeeksBefore",
  four_months_before: "reminderFourMonthsBefore",
}

export const ATTENDANCE_RESPONSE_LABEL_KEY: Record<AttendanceResponse, string> =
  {
    going: "rsvpGoing",
    interested: "rsvpInterested",
    not_going: "rsvpNotGoing",
  }
