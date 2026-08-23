/**
 * Posts a throwaway announcement to Discord so the webhook and role ping can be checked
 * without creating a real event.
 *
 *   pnpm discord:test
 *
 * What to look for in Discord:
 *   - @Poli renders as a blue clickable mention and actually notifies you.
 *     If it shows as raw text like <@&123…>, the role ID is wrong.
 *   - The date shows in your own timezone, and "in 2 days" below it.
 *   - The embed title links back to the site.
 */

import type { Event } from "../src/db/schema"
import { postEventToDiscord } from "../src/features/events/discord"

if (!process.env.DISCORD_GENERAL_CHANNEL_WEBHOOK_URL) {
  console.error("DISCORD_GENERAL_CHANNEL_WEBHOOK_URL is not set in .env.local")
  process.exit(1)
}

if (!process.env.DISCORD_MEMBER_ROLE_ID) {
  console.warn(
    "DISCORD_MEMBER_ROLE_ID is not set — the message will not ping anyone.",
  )
}

const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

const sampleEvent: Event = {
  id: "00000000-0000-0000-0000-000000000000",
  title: "Testinlägg — ignorera",
  description: "Kontrollerar att webhooken fungerar. Inget riktigt evenemang.",
  kind: "confirmed",
  startsAt: twoDaysFromNow,
  endsAt: null,
  timeZone: "Europe/Stockholm",
  location: "Ingenstans",
  category: "other",
  priceMinorUnits: null,
  priceCurrency: "SEK",
  maxAttendees: null,
  imageUrl: null,
  eventUrl: null,
  extraLinkUrl: null,
  visibility: "members",
  createdByMemberId: "00000000-0000-0000-0000-000000000000",
  discordAnnouncedAt: null,
  discordMessageId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
}

const messageId = await postEventToDiscord({
  event: sampleEvent,
  locale: "sv",
  leadText: "Testar webhooken",
})

if (messageId === null) {
  console.error("Failed. Check the error above and the webhook URL.")
  process.exit(1)
}

console.log(`Posted. Discord message id: ${messageId}`)
console.log("Delete the message in Discord once you've checked it.")

process.exit(0)
