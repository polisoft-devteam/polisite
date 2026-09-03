// Sending messages to Discord. Server-only: the webhook URL is a bearer secret.
//
// This is the transport. What each message says lives with the feature that sends it —
// features/events/discord.ts, features/members/discord.ts.

type DiscordEmbed = Record<string, unknown>

/**
 * A webhook is tied to one channel for good, so each destination needs its own.
 *
 * "general" is the channel everyone reads. "bot" is the private one only the admin sees;
 * it falls back to general if unset, so a message is never silently dropped — just posted
 * somewhere more public than intended.
 */
export type DiscordChannel = "general" | "bot"

function webhookUrlFor(channel: DiscordChannel): string | undefined {
  if (channel === "bot") {
    return (
      process.env.DISCORD_BOT_CHANNEL_WEBHOOK_URL ??
      process.env.DISCORD_GENERAL_CHANNEL_WEBHOOK_URL
    )
  }

  return process.env.DISCORD_GENERAL_CHANNEL_WEBHOOK_URL
}

type PostOptions = {
  channel: DiscordChannel
  content: string
  /** Role and user ids that this message is allowed to ping. */
  mentionRoleIds?: string[]
  mentionUserIds?: string[]
  embeds?: DiscordEmbed[]
}

/**
 * A kill switch for testing against the real association's Discord, which is the only
 * Discord there is: setting DISCORD_PAUSED=1 in .env.local stops every post while leaving
 * the rest of the flow, and the message it would have sent, exactly as they are.
 *
 * An environment variable rather than a flag in the code, because .env.local is not
 * committed and never reaches Vercel. There is nothing to remember to turn back on, and no
 * way for a testing session to silence production by accident.
 */
function isDiscordPaused(): boolean {
  return process.env.DISCORD_PAUSED === "1"
}

export function isDiscordConfigured(): boolean {
  return Boolean(process.env.DISCORD_GENERAL_CHANNEL_WEBHOOK_URL)
}

/**
 * Returns the message id, so a later edit can update that message instead of posting a
 * correction. Null if Discord isn't configured or the post failed — a notification going
 * missing must never break the thing that triggered it.
 */
export async function postToDiscord({
  channel,
  content,
  mentionRoleIds = [],
  mentionUserIds = [],
  embeds,
}: PostOptions): Promise<string | null> {
  if (isDiscordPaused()) {
    // Said out loud, so a paused run is never mistaken for a working one.
    console.warn(`[discord] paused, not posting to #${channel}: ${content}`)
    return null
  }

  const webhookUrl = webhookUrlFor(channel)
  if (!webhookUrl) return null

  try {
    // wait=true makes Discord return the created message rather than an empty 204.
    const response = await fetch(`${webhookUrl}?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        // Ids have to be listed here or Discord renders the mention as plain text and
        // pings nobody. parse: [] blocks @everyone even if it appears in the content.
        allowed_mentions: {
          parse: [],
          roles: mentionRoleIds,
          users: mentionUserIds,
        },
        ...(embeds ? { embeds } : {}),
      }),
    })

    if (!response.ok) {
      console.error(
        `[discord] post to #${channel} refused`,
        response.status,
        await response.text(),
      )
      return null
    }

    const message = (await response.json()) as { id?: string }
    return message.id ?? null
  } catch (error) {
    console.error(`[discord] post to #${channel} threw`, error)
    return null
  }
}

export function mentionRole(roleId: string | undefined): string {
  return roleId ? `<@&${roleId}> ` : ""
}

export function mentionUser(userId: string | undefined): string {
  return userId ? `<@${userId}> ` : ""
}
