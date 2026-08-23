// Posts event announcements and reminders to Discord.
//
// Server-only. The webhook URL is a bearer secret: anyone holding it can post to that
// channel. Never import this from a client component.
//
// Discord carries the notification; this app keeps the state. We never create Discord
// Scheduled Events, because those hold their own attendee list and "who's coming?" would
// then have two answers.

import type { Event } from "@/db/schema"
import { mentionRole, postToDiscord } from "@/lib/discord"
import { toDiscordTimestamp } from "@/lib/time"

// Emoji rather than the app's Lucide icons: a Discord message is text, so this is the
// only icon system available there.
const CATEGORY_EMOJI: Record<Event["category"], string> = {
  music: "🎵",
  party: "🎉",
  trip: "✈️",
  hike: "🥾",
  sport: "🏅",
  food: "🍽️",
  board_meeting: "📋",
  birthday: "🎂",
  other: "📌",
}

function buildEventUrl(event: Event, locale: string): string {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3210"

  return `${siteUrl}/${locale}/events/${event.id}`
}

function buildEmbed(event: Event, locale: string) {
  const fields: { name: string; value: string; inline?: boolean }[] = [
    // Discord renders these in each reader's own timezone, so the Dane and the Swede
    // both see their own local time without us converting anything.
    {
      name: "När",
      value: `${toDiscordTimestamp(event.startsAt)}\n${toDiscordTimestamp(event.startsAt, "R")}`,
    },
  ]

  if (event.location) {
    fields.push({ name: "Var", value: event.location, inline: true })
  }

  if (event.priceMinorUnits !== null) {
    fields.push({
      name: "Pris",
      value: `${(event.priceMinorUnits / 100).toFixed(2)} ${event.priceCurrency}`,
      inline: true,
    })
  }

  if (event.maxAttendees !== null) {
    fields.push({
      name: "Platser",
      value: String(event.maxAttendees),
      inline: true,
    })
  }

  return {
    title: `${CATEGORY_EMOJI[event.category]} ${event.title}`,
    url: buildEventUrl(event, locale),
    description: event.description?.slice(0, 500) ?? undefined,
    fields,
    image: event.imageUrl ? { url: event.imageUrl } : undefined,
  }
}

type PostOptions = {
  event: Event
  locale: string
  leadText: string
}

/** Null if Discord isn't configured or the post failed — never blocks saving the event. */
export async function postEventToDiscord({
  event,
  locale,
  leadText,
}: PostOptions): Promise<string | null> {
  const roleId = process.env.DISCORD_MEMBER_ROLE_ID

  return postToDiscord({
    channel: "general",
    content: `${mentionRole(roleId)}${leadText}`,
    mentionRoleIds: roleId ? [roleId] : [],
    embeds: [buildEmbed(event, locale)],
  })
}
