// Create and edit share this form. Native select and checkbox elements are used rather
// than the shadcn ones so the whole thing submits without a line of client JavaScript.

import { getTranslations } from "next-intl/server"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  eventCategoryEnum,
  reminderOffsetEnum,
  type Event,
  type EventCategory,
  type ReminderOffset,
} from "@/db/schema"
import { EVENT_CURRENCIES } from "@/features/events/schemas"
import {
  COMMON_EVENT_TIME_ZONES,
  DEFAULT_EVENT_TIME_ZONE,
  instantToWallTime,
  MAX_REMINDERS_PER_EVENT,
} from "@/lib/time"

const SELECT_CLASSES =
  "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none"

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

      <Field label={translateEvents("fieldTitle")} htmlFor="title">
        <Input
          id="title"
          name="title"
          defaultValue={event?.title ?? ""}
          required
          maxLength={140}
        />
      </Field>

      <Field label={translateEvents("fieldDescription")} htmlFor="description">
        <Textarea
          id="description"
          name="description"
          defaultValue={event?.description ?? ""}
          rows={4}
          maxLength={4000}
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field
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
        </Field>

        <Field
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
        </Field>
      </div>

      <Field
        label={translateEvents("fieldTimeZone")}
        htmlFor="timeZone"
        hint={translateEvents("fieldTimeZoneHint")}
      >
        <select
          id="timeZone"
          name="timeZone"
          defaultValue={timeZone}
          className={SELECT_CLASSES}
        >
          {COMMON_EVENT_TIME_ZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone.replace("_", " ")}
            </option>
          ))}
        </select>
      </Field>

      <Field label={translateEvents("fieldLocation")} htmlFor="location">
        <Input
          id="location"
          name="location"
          defaultValue={event?.location ?? ""}
          maxLength={200}
        />
      </Field>

      <Field label={translateEvents("fieldCategory")} htmlFor="category">
        <select
          id="category"
          name="category"
          defaultValue={event?.category ?? "other"}
          className={SELECT_CLASSES}
        >
          {eventCategoryEnum.enumValues.map((category) => (
            <option key={category} value={category}>
              {translateEvents(CATEGORY_TRANSLATION_KEY[category])}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field
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
        </Field>

        <Field label={translateEvents("fieldCurrency")} htmlFor="currency">
          <select
            id="currency"
            name="currency"
            defaultValue={event?.priceCurrency ?? "SEK"}
            className={SELECT_CLASSES}
          >
            {EVENT_CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field
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
      </Field>

      <Field label={translateEvents("fieldEventUrl")} htmlFor="eventUrl">
        <Input
          id="eventUrl"
          name="eventUrl"
          type="url"
          placeholder="https://"
          defaultValue={event?.eventUrl ?? ""}
        />
      </Field>

      <Field
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
      </Field>

      <Field
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
      </Field>

      <Field label={translateEvents("fieldVisibility")} htmlFor="visibility">
        <select
          id="visibility"
          name="visibility"
          defaultValue={event?.visibility === "public" ? "public" : "members"}
          className={SELECT_CLASSES}
        >
          <option value="members">
            {translateEvents("visibilityMembers")}
          </option>
          <option value="public">{translateEvents("visibilityPublic")}</option>
        </select>
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">
          {translateEvents("fieldReminders")}
        </legend>
        <p className="text-muted-foreground text-xs">
          {translateEvents("fieldRemindersHint")}
          {` (${MAX_REMINDERS_PER_EVENT})`}
        </p>
        <div className="space-y-2 pt-1">
          {reminderOffsetEnum.enumValues.map((offset) => (
            <label
              key={offset}
              className="flex items-center gap-2 text-sm font-normal"
            >
              <input
                type="checkbox"
                name="reminderOffsets"
                value={offset}
                defaultChecked={reminderOffsets.includes(offset)}
                className="border-input size-4 rounded border"
              />
              {translateEvents(REMINDER_TRANSLATION_KEY[offset])}
            </label>
          ))}
        </div>
      </fieldset>

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

      <Button type="submit">{submitLabel}</Button>
    </form>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}
