"use server"

import { revalidatePath } from "next/cache"

import { markNotificationsSeen } from "@/features/notifications/queries"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"

/** Called when the list is opened: everything in it has now been looked at. */
export async function markNotificationsSeenAction(): Promise<void> {
  const viewer = await getViewer()
  if (!isActiveMember(viewer)) return

  await markNotificationsSeen(viewer!.member!.id)

  revalidatePath("/", "layout")
}
