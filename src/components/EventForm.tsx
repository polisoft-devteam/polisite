// Creating and editing an event, as a three-step wizard.
//
// Three rather than five: everything that has a sensible default sits in a folded
// "Fler inställningar" section on the last step, so the common path is title, when and
// where, publish.
//
// Nothing is written until the final submit — the form is one POST, so stepping through it
// has no effect and no Discord message goes out early.
//
// Nothing is remembered between visits either. Every step stays mounted and merely hidden,
// and so does the Advanced panel, so the values survive stepping back and forth on their
// own. Leaving the page is meant to lose them: a form that reopens holding the last event
// you created is worse than one that starts empty.

"use client"

import { useActionState, useState } from "react"
import { useTranslations } from "next-intl"

import type { EventFormInput } from "@/features/events/schemas"
import type { FormFeedback } from "@/lib/form-feedback"

import { EventWhenField } from "@/components/EventWhenField"
import { EventReminderField } from "@/components/EventReminderField"
import { ExplainedSelectField } from "@/components/ExplainedSelectField"
import { EventCategoryField } from "@/components/EventCategoryField"
import { EventLocationField } from "@/components/EventLocationField"
import { FormField, FormSelect } from "@/components/FormField"
import { ImageDropZone } from "@/components/ImageDropZone"
import { UnsavedWorkGuard } from "@/components/UnsavedWorkGuard"
import { Wizard, type WizardStep } from "@/components/Wizard"
import { PublishEventIcon, SaveIcon } from "@/lib/icons"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  eventCategoryEnum,
  eventKindEnum,
  eventVisibilityEnum,
  reminderOffsetEnum,
  type Event,
  type EventCategory,
  type ReminderOffset,
} from "@/db/schema"
import {
  EVENT_CATEGORY_LABEL_KEY,
  EVENT_KIND_EXPLANATION_KEY,
  EVENT_KIND_LABEL_KEY,
  EVENT_VISIBILITY_EXPLANATION_KEY,
  EVENT_VISIBILITY_LABEL_KEY,
  REMINDER_OFFSET_LABEL_KEY,
} from "@/features/events/labels"
import { EVENT_CURRENCIES } from "@/features/events/schemas"
import {
  COMMON_EVENT_TIME_ZONES,
  DEFAULT_EVENT_TIME_ZONE,
  defaultEventWallTimes,
  instantToWallTime,
} from "@/lib/time"

type EventFormProps = {
  action: (
    previous: FormFeedback<EventFormInput>,
    formData: FormData,
  ) => Promise<FormFeedback<EventFormInput>>
  submitLabel: string
  /** Absent when creating. */
  event?: Event
  reminderOffsets?: ReminderOffset[]
  /** Existing candidate dates, as datetime-local strings. */
  dateOptions?: string[]
}

export function EventForm({
  action,
  submitLabel,
  event,
  reminderOffsets = [],
  dateOptions = [],
}: EventFormProps) {
  const translateEvents = useTranslations("Events")
  const [feedback, formAction, isSubmitting] = useActionState(action, null)

  // Anything typed is worth a question before it is thrown away; see UnsavedWorkGuard.
  const [hasTyped, setHasTyped] = useState(false)

  // What was typed, when the server sent it back. React empties an uncontrolled form once
  // its action returns, and the reset lands on whatever the fields' defaults say by then,
  // so handing these back as the defaults is what saves the typing.
  const submitted = feedback?.values

  const timeZone =
    submitted?.timeZone ?? event?.timeZone ?? DEFAULT_EVENT_TIME_ZONE

  // A new event opens on today and tomorrow. An existing one keeps what it has, including
  // the empty pair that means it runs on a date poll instead.
  const defaultWhen = submitted
    ? {
        startsAt: submitted.startsAtWallTime,
        endsAt: submitted.endsAtWallTime,
      }
    : event
      ? {
          startsAt: event.startsAt
            ? instantToWallTime(event.startsAt, timeZone)
            : "",
          endsAt: event.endsAt ? instantToWallTime(event.endsAt, timeZone) : "",
        }
      : defaultEventWallTimes(timeZone)

  const steps: WizardStep[] = [
    {
      label: translateEvents("stepBasics"),
      content: (
        <>
          <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
            <FormField label={translateEvents("fieldTitle")} htmlFor="title">
              <Input
                id="title"
                name="title"
                defaultValue={submitted?.title ?? event?.title ?? ""}
                required
                maxLength={140}
              />
            </FormField>

            <EventCategoryField
              label={translateEvents("fieldCategory")}
              // Read back as a plain string; the schema is what decides whether it was
              // one of ours, and it has already had its say by the time this renders.
              defaultValue={
                (submitted?.category as EventCategory | undefined) ??
                event?.category ??
                "other"
              }
              options={eventCategoryEnum.enumValues.map((category) => ({
                value: category,
                label: translateEvents(EVENT_CATEGORY_LABEL_KEY[category]),
              }))}
            />
          </div>

          <FormField
            label={translateEvents("fieldDescription")}
            htmlFor="description"
          >
            <Textarea
              id="description"
              name="description"
              defaultValue={submitted?.description ?? event?.description ?? ""}
              rows={4}
              maxLength={4000}
            />
          </FormField>

          <ImageDropZone
            id="image"
            name="image"
            label={translateEvents("fieldImage")}
            hint={translateEvents("fieldImageHint")}
            currentImageUrl={event?.imageUrl}
          />

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
              defaultValue={submitted?.eventUrl ?? event?.eventUrl ?? ""}
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
              defaultValue={
                submitted?.extraLinkUrl ?? event?.extraLinkUrl ?? ""
              }
            />
          </FormField>
        </>
      ),
    },

    {
      label: translateEvents("stepWhen"),
      content: (
        <>
          <div className="grid gap-4 sm:grid-cols-[3fr_1fr]">
            <EventLocationField
              label={translateEvents("fieldLocation")}
              onlineLabel={translateEvents("fieldIsOnline")}
              onlineHint={translateEvents("fieldIsOnlineHint")}
              placeholder={translateEvents("fieldLocationPlaceholder")}
              defaultLocation={submitted?.location ?? event?.location ?? ""}
              defaultIsOnline={submitted?.isOnline ?? event?.isOnline ?? false}
            />

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
          </div>

          {/* Next to the dates rather than folded into Advanced: a date poll only makes
              sense for a suggestion, and a confirmed event is rejected without a date, so
              the two belong in view of each other. */}
          <ExplainedSelectField
            name="kind"
            label={translateEvents("fieldKind")}
            defaultValue={submitted?.kind ?? event?.kind ?? "confirmed"}
            options={eventKindEnum.enumValues.map((kind) => ({
              value: kind,
              label: translateEvents(EVENT_KIND_LABEL_KEY[kind]),
              explanation: translateEvents(EVENT_KIND_EXPLANATION_KEY[kind]),
            }))}
          />

          <EventWhenField
            startsAtLabel={translateEvents("fieldStartsAt")}
            endsAtLabel={translateEvents("fieldEndsAt")}
            endsAtHint={translateEvents("fieldEndsAtHint")}
            orLabel={translateEvents("orDivider")}
            pollLegend={translateEvents("fieldDatePoll")}
            pollHint={translateEvents("fieldDatePollHint")}
            addDateLabel={translateEvents("addDateOption")}
            removeDateLabel={translateEvents("removeDateOption")}
            defaultStartsAt={defaultWhen.startsAt}
            defaultEndsAt={defaultWhen.endsAt}
            defaultDateOptions={submitted?.dateOptions ?? dateOptions}
          />
        </>
      ),
    },

    {
      label: translateEvents("stepPublish"),
      content: (
        <>
          <EventReminderField
            legend={translateEvents("fieldReminders")}
            hint={translateEvents("fieldRemindersHint")}
            atLimitHint={translateEvents("fieldRemindersAtLimit")}
            defaultSelected={
              (submitted?.reminderOffsets as ReminderOffset[] | undefined) ??
              reminderOffsets
            }
            options={reminderOffsetEnum.enumValues.map((offset) => ({
              value: offset,
              label: translateEvents(REMINDER_OFFSET_LABEL_KEY[offset]),
            }))}
          />

          {/* Everything with a sensible default lives here, folded away. */}
          <Accordion className="border-border rounded-lg border">
            <AccordionItem value="advanced">
              <AccordionTrigger className="px-4 hover:no-underline">
                {translateEvents("advancedTitle")}
              </AccordionTrigger>
              {/* Kept mounted, so the fields inside survive being collapsed. Without it
                  the panel unmounts them: anything set here was forgotten on reopening,
                  and worse, was not submitted at all if the section was closed. */}
              <AccordionContent keepMounted className="px-4">
                <p className="text-muted-foreground mb-4 text-xs">
                  {translateEvents("advancedHint")}
                </p>

                <div className="space-y-6">
                  <ExplainedSelectField
                    name="visibility"
                    label={translateEvents("fieldVisibility")}
                    defaultValue={
                      submitted?.visibility ?? event?.visibility ?? "members"
                    }
                    options={eventVisibilityEnum.enumValues.map(
                      (visibility) => ({
                        value: visibility,
                        label: translateEvents(
                          EVENT_VISIBILITY_LABEL_KEY[visibility],
                        ),
                        explanation: translateEvents(
                          EVENT_VISIBILITY_EXPLANATION_KEY[visibility],
                        ),
                      }),
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-[1fr_7rem_1fr] sm:items-start">
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
                          submitted?.price ??
                          (event?.priceMinorUnits !== null &&
                          event?.priceMinorUnits !== undefined
                            ? String(event.priceMinorUnits / 100)
                            : "")
                        }
                      />
                    </FormField>

                    <FormField
                      label={translateEvents("fieldCurrency")}
                      htmlFor="currency"
                    >
                      <FormSelect
                        id="currency"
                        name="currency"
                        defaultValue={
                          submitted?.currency ?? event?.priceCurrency ?? "SEK"
                        }
                      >
                        {EVENT_CURRENCIES.map((currency) => (
                          <option key={currency} value={currency}>
                            {currency}
                          </option>
                        ))}
                      </FormSelect>
                    </FormField>

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
                        defaultValue={
                          submitted?.maxAttendees ?? event?.maxAttendees ?? ""
                        }
                      />
                    </FormField>
                  </div>

                  <FormField
                    label={translateEvents("fieldSpotifyUrl")}
                    htmlFor="spotifyUrl"
                    hint={translateEvents("fieldSpotifyUrlHint")}
                  >
                    <Input
                      id="spotifyUrl"
                      name="spotifyUrl"
                      type="url"
                      placeholder="https://open.spotify.com/playlist/…"
                      defaultValue={
                        submitted?.spotifyUrl ?? event?.spotifyUrl ?? ""
                      }
                    />
                  </FormField>

                  {/* Only meaningful when creating; an edit shouldn't re-announce. */}
                  {!event && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        name="announceOnDiscord"
                        defaultChecked={submitted?.announceOnDiscord ?? true}
                        className="border-input size-4 rounded border"
                      />
                      {translateEvents("fieldAnnounce")}
                    </label>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <p className="text-muted-foreground text-xs">
            {translateEvents("publishSummary")}
          </p>
        </>
      ),
    },
  ]

  // Field name to the label it carries in the form, so a refusal reads as "Adress" rather
  // than as "location".
  const fieldLabels = {
    title: translateEvents("fieldTitle"),
    description: translateEvents("fieldDescription"),
    startsAtWallTime: translateEvents("fieldStartsAt"),
    endsAtWallTime: translateEvents("fieldEndsAt"),
    timeZone: translateEvents("fieldTimeZone"),
    location: translateEvents("fieldLocation"),
    category: translateEvents("fieldCategory"),
    price: translateEvents("fieldPrice"),
    currency: translateEvents("fieldCurrency"),
    maxAttendees: translateEvents("fieldMaxAttendees"),
    eventUrl: translateEvents("fieldEventUrl"),
    extraLinkUrl: translateEvents("fieldExtraLinkUrl"),
    spotifyUrl: translateEvents("fieldSpotifyUrl"),
    visibility: translateEvents("fieldVisibility"),
    reminderOffsets: translateEvents("fieldReminders"),
    dateOptions: translateEvents("fieldDatePoll"),
    kind: translateEvents("fieldKind"),
  }

  return (
    <>
      <UnsavedWorkGuard
        // Not while it is posting: the page is on its way somewhere by then.
        isDirty={hasTyped && !isSubmitting}
        title={translateEvents("unsavedTitle")}
        body={translateEvents("unsavedBody")}
        leaveLabel={translateEvents("unsavedLeave")}
        stayLabel={translateEvents("unsavedStay")}
        closeLabel={translateEvents("close")}
      />

      <Wizard
        steps={steps}
        formAction={formAction}
        onFieldInput={() => setHasTyped(true)}
        feedback={feedback}
        isSubmitting={isSubmitting}
        hiddenFields={
          event && <input type="hidden" name="eventId" value={event.id} />
        }
        invalidHeading={translateEvents("formInvalid")}
        fieldLabels={fieldLabels}
        submitLabel={submitLabel}
        // Publishing a new event is a small celebration; saving an edit is filing.
        submitIcon={
          event ? (
            <SaveIcon className="size-4" />
          ) : (
            <PublishEventIcon className="size-4" />
          )
        }
        submittingLabel={
          event ? translateEvents("saving") : translateEvents("publishing")
        }
        backLabel={translateEvents("wizardBack")}
        nextLabel={translateEvents("wizardNext")}
        stepLabel={translateEvents("wizardStep")}
      />
    </>
  )
}
