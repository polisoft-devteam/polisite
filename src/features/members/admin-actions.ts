"use server"

import { revalidatePath } from "next/cache"

import {
  approveMembershipRequest,
  denyMembershipRequest,
  findRolesForMember,
  setMemberStatus,
} from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { canDeactivateMember, canManageMembers } from "@/lib/permissions"

/** Re-read here rather than trusting that the page was only shown to an admin. */
async function requireAdmin() {
  const viewer = await getViewer()

  if (!canManageMembers(viewer)) {
    throw new Error("Not allowed to manage members")
  }

  return viewer!
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

export async function deactivateMember(formData: FormData) {
  const viewer = await requireAdmin()
  const memberId = String(formData.get("memberId") ?? "")

  const target = { id: memberId, roles: await findRolesForMember(memberId) }

  if (!canDeactivateMember(viewer, target)) {
    throw new Error("Not allowed to deactivate this member")
  }

  await setMemberStatus(memberId, "inactive")

  revalidatePath("/", "layout")
}

export async function reactivateMember(formData: FormData) {
  await requireAdmin()

  await setMemberStatus(String(formData.get("memberId") ?? ""), "active")

  revalidatePath("/", "layout")
}
