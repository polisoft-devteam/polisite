// Create and edit share this form. Native selects and checkboxes post without any client
// JavaScript; only the two fields that must react to what you pick are client components.

import { getTranslations } from "next-intl/server"

import { EventReminderField } from "@/components/EventReminderField"
import { FormField, FormSelect } from "@/components/FormField"
import { EventVisibilityField } from "@/components/EventVisibilityField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  eventCategoryEnum,
  eventVisibilityEnum,
  reminderOffsetEnum,
  type Event,
  type EventCategory,
  type EventVisibility,
  type ReminderOffset,
} from "@/db/schema"
import { EVENT_CURRENCIES } from "@/features/events/schemas"
import {
  COMMON_EVENT_TIME_ZONES,
  DEFAULT_EVENT_TIME_ZONE,
  instantToWallTime,
} from "@/lib/time"

const CATEGORY_TRANSLATION_KEY: Record<EventCategory, string> = {
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

const VISIBILITY_TRANSLATION_KEY: Record<EventVisibility, string> = {
  public: "visibilityPublic",
  members: "visibilityMembers",
  members_and_friends: "visibilityMembersAndFriends",
}

const VISIBILITY_EXPLANATION_KEY: Record<EventVisibility, string> = {
  public: "visibilityPublicExplanation",
  members: "visibilityMembersExplanation",
  members_and_friends: "visibilityMembersAndFriendsExplanation",
}

const REMINDER_TRANSLATION_KEY: Record<ReminderOffset, string> = {
  day_before: "reminderDayBefore",
  week_before: "reminderWeekBefore",
  four_weeks_before: "reminderFourWeeksBefore",
  four_months_before: "reminderFourMonthsBefore",
}

type EventFormProps = {
  action: (formData: FormData) => Promise<void>
  submitLabel: string
  /** Absent when creating. */
  event?: Event
  reminderOffsets?: ReminderOffset[]
}

export async function EventForm({
  action,
  submitLabel,
  event,
  reminderOffsets = [],
}: EventFormProps) {
  const translateEvents = await getTranslations("Events")

  const timeZone = event?.timeZone ?? DEFAULT_EVENT_TIME_ZONE

  return (
    <form action={action} className="mt-8 max-w-lg space-y-6">
      {event && <input type="hidden" name="eventId" value={event.id} />}

      <FormField label={translateEvents("fieldTitle")} htmlFor="title">
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? ""}
          required
          maxLength={140}
        />
      </FormField>

      <FormField
        label={translateEvents("fieldDescription")}
        htmlFor="description"
      >
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
          rows={4}
          maxLength={4000}
        />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={translateEvents("fieldStartsAt")}
          htmlFor="startsAtWallTime"
        >
          <Input
            id="startsAtWallTime"
            name="startsAtWallTime"
            type="datetime-local"
            defaultValue={
              event ? instantToWallTime(event.startsAt, timeZone) : ""
            }
            required
          />
        </FormField>

        <FormField
          label={translateEvents("fieldEndsAt")}
          htmlFor="endsAtWallTime"
          hint={translateEvents("fieldEndsAtHint")}
        >
          <Input
            id="endsAtWallTime"
            name="endsAtWallTime"
            type="datetime-local"
            defaultValue={
              event?.endsAt ? instantToWallTime(event.endsAt, timeZone) : ""
            }
          />
        </FormField>
      </div>

      <FormField
        label={translateEvents("fieldTimeZone")}
        htmlFor="timeZone"
        hint={translateEvents("fieldTimeZoneHint")}
      >
        <FormSelect id="timeZone" name="timeZone" defaultValue={timeZone}>
          {COMMON_EVENT_TIME_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace("_", " ")}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <FormField label={translateEvents("fieldLocation")} htmlFor="location">
        <Input
          id="location"
          name="location"
          defaultValue={event?.location ?? ""}
          maxLength={200}
        />
      </FormField>

      <FormField label={translateEvents("fieldCategory")} htmlFor="category">
        <FormSelect
          id="category"
          name="category"
          defaultValue={event?.category ?? "other"}
        >
          {eventCategoryEnum.enumValues.map((category) => (
            <option key={category} value={category}>
              {translateEvents(CATEGORY_TRANSLATION_KEY[category])}
            </option>
          ))}
        </FormSelect>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <FormField
          label={translateEvents("fieldPrice")}
          htmlFor="price"
          hint={translateEvents("fieldPriceHint")}
        >
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            inputMode="decimal"
            defaultValue={
              event?.priceMinorUnits !== null &&
              event?.priceMinorUnits !== undefined
                ? String(event.priceMinorUnits / 100)
                : ""
            }
          />
        </FormField>

        <FormField label={translateEvents("fieldCurrency")} htmlFor="currency">
          <FormSelect
            id="currency"
            name="currency"
            defaultValue={event?.priceCurrency ?? "SEK"}
          >
            {EVENT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </FormSelect>
        </FormField>
      </div>

      <FormField
        label={translateEvents("fieldMaxAttendees")}
        htmlFor="maxAttendees"
        hint={translateEvents("fieldMaxAttendeesHint")}
      >
        <Input
          id="maxAttendees"
          name="maxAttendees"
          type="number"
          min="1"
          step="1"
          defaultValue={event?.maxAttendees ?? ""}
        />
      </FormField>

      <FormField
        label={translateEvents("fieldEventUrl")}
        htmlFor="eventUrl"
        hint={translateEvents("fieldEventUrlHint")}
      >
        <Input
          id="eventUrl"
          name="eventUrl"
          type="url"
          placeholder="https://"
          defaultValue={event?.eventUrl ?? ""}
        />
      </FormField>

      <FormField
        label={translateEvents("fieldExtraLinkUrl")}
        htmlFor="extraLinkUrl"
        hint={translateEvents("fieldExtraLinkUrlHint")}
      >
        <Input
          id="extraLinkUrl"
          name="extraLinkUrl"
          type="url"
          placeholder="https://"
          defaultValue={event?.extraLinkUrl ?? ""}
        />
      </FormField>

      <FormField
        label={translateEvents("fieldImageUrl")}
        htmlFor="imageUrl"
        hint={translateEvents("fieldImageUrlHint")}
      >
        <Input
          id="imageUrl"
          name="imageUrl"
          type="url"
          placeholder="https://"
          defaultValue={event?.imageUrl ?? ""}
        />
      </FormField>

      <EventVisibilityField
        label={translateEvents("fieldVisibility")}
        defaultValue={event?.visibility ?? "members"}
        options={eventVisibilityEnum.enumValues.map((visibility) => ({
          value: visibility,
          label: translateEvents(VISIBILITY_TRANSLATION_KEY[visibility]),
          explanation: translateEvents(VISIBILITY_EXPLANATION_KEY[visibility]),
        }))}
      />

      <EventReminderField
        legend={translateEvents("fieldReminders")}
        hint={translateEvents("fieldRemindersHint")}
        atLimitHint={translateEvents("fieldRemindersAtLimit")}
        defaultSelected={reminderOffsets}
        options={reminderOffsetEnum.enumValues.map((offset) => ({
          value: offset,
          label: translateEvents(REMINDER_TRANSLATION_KEY[offset]),
        }))}
      />

      {/* Only meaningful when creating; an edit shouldn't re-announce. */}
      {!event && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="announceOnDiscord"
            defaultChecked
            className="border-input size-4 rounded border"
          />
          {translateEvents("fieldAnnounce")}
        </label>
      )}

      <Button type="submit" size="lg">
        {submitLabel}
      </Button>
    </form>
  )
}
