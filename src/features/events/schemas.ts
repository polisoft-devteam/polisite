// What the server will accept when an event is created or edited.
// The browser's maxlength attributes are a typing convenience; this is the control.

import { z } from "zod"

import {
  eventCategoryEnum,
  eventKindEnum,
  eventVisibilityEnum,
  reminderOffsetEnum,
} from "@/db/schema"
import { COMMON_EVENT_TIME_ZONES, MAX_REMINDERS_PER_EVENT } from "@/lib/time"

export const EVENT_CURRENCIES = ["SEK", "DKK", "NOK", "EUR", "GBP"] as const

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value.length === 0 ? null : value))
    .nullable()

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .transform((value) => (value.length === 0 ? null : value))
  .nullable()
  .refine(
    (value) => value === null || /^https?:\/\//.test(value),
    "Links must start with http:// or https://",
  )

export const eventFormSchema = z
  .object({
    title: z.string().trim().min(1).max(140),
    description: optionalText(4000),

    kind: z.enum(eventKindEnum.enumValues),

    // Wall-clock time as typed, plus the zone it was meant in. Converted to a UTC
    // instant in the action — see lib/time.ts.
    //
    // Optional: a suggestion may have no date until its poll resolves. Required for a
    // confirmed event, which the refine below enforces.
    startsAtWallTime: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      .or(z.literal(""))
      .transform((value) => (value === "" ? null : value)),
    endsAtWallTime: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
      .or(z.literal(""))
      .transform((value) => (value === "" ? null : value)),
    timeZone: z.enum(COMMON_EVENT_TIME_ZONES),

    location: optionalText(200),
    category: z.enum(eventCategoryEnum.enumValues),

    // Major units as typed ("250"), converted to minor units below. Blank means free.
    price: z
      .string()
      .trim()
      .transform((value) => (value.length === 0 ? null : Number(value)))
      .nullable()
      .refine(
        (value) => value === null || (Number.isFinite(value) && value >= 0),
        "Price must be a number, or blank for free",
      ),
    currency: z.enum(EVENT_CURRENCIES),

    // Blank means unlimited.
    maxAttendees: z
      .string()
      .trim()
      .transform((value) => (value.length === 0 ? null : Number(value)))
      .nullable()
      .refine(
        (value) => value === null || (Number.isInteger(value) && value >= 1),
        "Maximum attendees must be a whole number of at least 1",
      ),

    eventUrl: optionalUrl,
    extraLinkUrl: optionalUrl,

    visibility: z.enum(eventVisibilityEnum.enumValues),

    reminderOffsets: z
      .array(z.enum(reminderOffsetEnum.enumValues))
      .max(MAX_REMINDERS_PER_EVENT)
      .transform((offsets) => [...new Set(offsets)]),

    // Candidate dates members can vote between. Blank rows are dropped.
    dateOptions: z
      .array(z.string())
      .transform((values) =>
        values.filter((value) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)),
      )
      .transform((values) => [...new Set(values)])
      .refine((values) => values.length <= 12, "At most 12 dates to vote on"),

    announceOnDiscord: z.boolean(),
  })
  .refine(
    (event) => event.kind !== "confirmed" || event.startsAtWallTime !== null,
    {
      message: "A confirmed event needs a date",
      path: ["startsAtWallTime"],
    },
  )
  .refine(
    (event) =>
      event.endsAtWallTime === null ||
      event.startsAtWallTime === null ||
      event.endsAtWallTime > event.startsAtWallTime,
    {
      message: "An event cannot end before it starts",
      path: ["endsAtWallTime"],
    },
  )

export type EventFormValues = z.infer<typeof eventFormSchema>

/** Reads a submitted form into the shape the schema expects. */
export function readEventForm(formData: FormData) {
  const readText = (field: string) => String(formData.get(field) ?? "")

  return {
    title: readText("title"),
    description: readText("description"),
    kind: readText("kind"),
    startsAtWallTime: readText("startsAtWallTime"),
    endsAtWallTime: readText("endsAtWallTime"),
    timeZone: readText("timeZone"),
    location: readText("location"),
    category: readText("category"),
    price: readText("price"),
    currency: readText("currency"),
    maxAttendees: readText("maxAttendees"),
    eventUrl: readText("eventUrl"),
    extraLinkUrl: readText("extraLinkUrl"),
    visibility: readText("visibility"),
    dateOptions: formData.getAll("dateOptions").map(String),
    reminderOffsets: formData.getAll("reminderOffsets").map(String),
    announceOnDiscord: formData.get("announceOnDiscord") === "on",
  }
}

/** Major units as typed by a human → minor units as stored. */
export function toMinorUnits(price: number | null): number | null {
  return price === null ? null : Math.round(price * 100)
}
