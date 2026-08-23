// Tells the admin that someone has asked to join.

import { mentionUser, postToDiscord } from "@/lib/discord"

/**
 * Includes the exact command to approve them, so acting on it is a copy and paste rather
 * than a trip to the dashboard.
 */
export async function postMembershipRequestToDiscord(request: {
  email: string
  fullName: string | null
}): Promise<void> {
  const adminUserId = process.env.DISCORD_ADMIN_USER_ID

  const who = request.fullName
    ? `${request.fullName} (${request.email})`
    : request.email

  await postToDiscord({
    channel: "bot",
    content: [
      `${mentionUser(adminUserId)}**${who}** har ansökt om medlemskap i Poli.`,
      "",
      "Godkänn med:",
      "```",
      `pnpm member ${request.email} --status active`,
      "```",
    ].join("\n"),
    mentionUserIds: adminUserId ? [adminUserId] : [],
  })
}
