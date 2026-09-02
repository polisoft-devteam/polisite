"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import { BADGE_KEYS } from "@/features/members/badges"
import {
  awardBadge,
  removeBadge,
  setMemberTitle,
} from "@/features/members/queries"
import { isMemberTitle } from "@/features/members/titles"
import { getViewer } from "@/lib/auth"
import { canAwardBadges } from "@/lib/permissions"

const badgeFormSchema = z.object({
  memberId: z.string().uuid(),
  badge: z.string().refine((value) => BADGE_KEYS.includes(value)),
})

// An empty string clears the office, which is why this is not just the enum.
const titleFormSchema = z.object({
  memberId: z.string().uuid(),
  officialTitle: z
    .string()
    .refine((value) => value === "" || isMemberTitle(value)),
})

function readMemberId(formData: FormData) {
  return String(formData.get("memberId") ?? "")
}

export async function awardBadgeAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canAwardBadges(viewer)) return

  const form = badgeFormSchema.safeParse({
    memberId: readMemberId(formData),
    badge: String(formData.get("badge") ?? ""),
  })
  if (!form.success) return

  await awardBadge({ ...form.data, awardedByMemberId: viewer!.member!.id })

  revalidatePath("/admin")
  revalidatePath("/members/[memberId]", "page")
}

export async function removeBadgeAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canAwardBadges(viewer)) return

  const form = badgeFormSchema.safeParse({
    memberId: readMemberId(formData),
    badge: String(formData.get("badge") ?? ""),
  })
  if (!form.success) return

  await removeBadge(form.data.memberId, form.data.badge)

  revalidatePath("/admin")
  revalidatePath("/members/[memberId]", "page")
}

export async function setMemberTitleAction(formData: FormData): Promise<void> {
  const viewer = await getViewer()
  if (!canAwardBadges(viewer)) return

  const form = titleFormSchema.safeParse({
    memberId: readMemberId(formData),
    officialTitle: String(formData.get("officialTitle") ?? ""),
  })
  if (!form.success) return

  await setMemberTitle(form.data.memberId, form.data.officialTitle || null)

  revalidatePath("/admin")
  revalidatePath("/members/[memberId]", "page")
  revalidatePath("/profile")
}
