"use server"

import { revalidatePath } from "next/cache"

import {
  approveMembershipRequest,
  denyMembershipRequest,
} from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { canManageMembers } from "@/lib/permissions"

/** Re-read here rather than trusting that the page was only shown to an admin. */
async function requireAdmin() {
  const viewer = await getViewer()

  if (!canManageMembers(viewer)) {
    throw new Error("Not allowed to manage members")
  }
}

export async function approveMembership(formData: FormData) {
  await requireAdmin()

  await approveMembershipRequest(String(formData.get("authUserId") ?? ""))

  revalidatePath("/", "layout")
}

export async function denyMembership(formData: FormData) {
  await requireAdmin()

  await denyMembershipRequest(String(formData.get("authUserId") ?? ""))

  revalidatePath("/", "layout")
}
