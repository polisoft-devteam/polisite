// Tells the admin that someone has asked to join.
//
// Deliberately carries no name, email or id. A Discord channel is a permanent log nobody
// can redact, and there's no reason to put a member's address in one when the admin page
// can show it to whoever is allowed to see it. The message is a nudge; the page is the data.

import { mentionRole, mentionUser, postToDiscord } from "@/lib/discord"
import { getSiteUrl } from "@/lib/site-url"

export async function postMembershipRequestToDiscord(): Promise<void> {
  const adminUserId = process.env.DISCORD_ADMIN_USER_ID

  await postToDiscord({
    channel: "bot",
    content: [
      `${mentionUser(adminUserId)}Någon har ansökt om medlemskap i Poli.`,
      `Godkänn eller avslå: ${getSiteUrl()}/sv/admin`,
    ].join("\n"),
    mentionUserIds: adminUserId ? [adminUserId] : [],
  })
}

/**
 * Happy birthday, in the general channel, mentioning the member role so it lands as a
 * notification rather than as another line nobody reads.
 */
export async function postBirthdayToDiscord(names: string[]): Promise<void> {
  if (names.length === 0) return

  const roleId = process.env.DISCORD_MEMBER_ROLE_ID

  const who =
    names.length === 1
      ? names[0]
      : `${names.slice(0, -1).join(", ")} och ${names.at(-1)}`

  await postToDiscord({
    channel: "general",
    content: `${mentionRole(roleId)}Grattis på födelsedagen, ${who}! 🎉`,
    mentionRoleIds: roleId ? [roleId] : [],
  })
}
