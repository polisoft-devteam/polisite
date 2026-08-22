// Sending messages to Discord. Server-only: the webhook URL is a bearer secret.
//
// This is the transport. What each message says lives with the feature that sends it —
// features/events/discord.ts, features/members/discord.ts.

type DiscordEmbed = Record<string, unknown>

type PostOptions = {
  content: string
  /** Role and user ids that this message is allowed to ping. */
  mentionRoleIds?: string[]
  mentionUserIds?: string[]
  embeds?: DiscordEmbed[]
}

export function isDiscordConfigured(): boolean {
  return Boolean(process.env.DISCORD_WEBHOOK_URL)
}

/**
 * Returns the message id, so a later edit can update that message instead of posting a
 * correction. Null if Discord isn't configured or the post failed — a notification going
 * missing must never break the thing that triggered it.
 */
export async function postToDiscord({
  content,
  mentionRoleIds = [],
  mentionUserIds = [],
  embeds,
}: PostOptions): Promise<string | null> {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL
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
        "Discord post failed",
        response.status,
        await response.text(),
      )
      return null
    }

    const message = (await response.json()) as { id?: string }
    return message.id ?? null
  } catch (error) {
    console.error("Discord post threw", error)
    return null
  }
}

export function mentionRole(roleId: string | undefined): string {
  return roleId ? `<@&${roleId}> ` : ""
}

export function mentionUser(userId: string | undefined): string {
  return userId ? `<@${userId}> ` : ""
}
