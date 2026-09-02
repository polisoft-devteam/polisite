"use server"

import { revalidatePath } from "next/cache"
import { getLocale } from "next-intl/server"
import { z } from "zod"

import {
  findBadgesForMember,
  findMemberById,
  updateMemberProfile,
} from "@/features/members/queries"
import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { canManageMembers, isActiveMember } from "@/lib/permissions"
import { deleteImageIfOurs, uploadImage } from "@/lib/storage"

// Validated on the server because this is the boundary. Anything the browser sends is
// untrusted — client-side validation is a convenience, never a control. See CLAUDE.md.
const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  nickname: z.string().trim().max(60),
  bio: z.string().trim().max(2000),

  // A URL or nothing. An empty string is the usual case and must not fail validation.
  githubUrl: z.union([z.literal(""), z.string().trim().url().max(300)]),

  // yyyy-mm-dd from a date input, or nothing. Stored as a date, never a timestamp, so it
  // cannot shift a day across timezones.
  birthday: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),

  // A badge key or nothing. Whether they hold it is checked against the awards, not here.
  displayedBadge: z.string().max(40),
})

/** Empty inputs come through as "" — store null so the database has one kind of blank. */
function emptyToNull(value: string): string | null {
  return value.length === 0 ? null : value
}

async function saveProfile(memberId: string, formData: FormData) {
  const heldBadges = new Set(
    (await findBadgesForMember(memberId)).map((badge) => badge.badge),
  )

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    nickname: formData.get("nickname") ?? "",
    bio: formData.get("bio") ?? "",
    birthday: formData.get("birthday") ?? "",
    displayedBadge: formData.get("displayedBadge") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
  })

  if (!parsed.success) return null

  const uploadedAvatarUrl = await uploadImage(
    "avatars",
    formData.get("avatar") as File | null,
  )

  await updateMemberProfile(memberId, {
    fullName: parsed.data.fullName,
    nickname: emptyToNull(parsed.data.nickname),
    bio: emptyToNull(parsed.data.bio),
    birthday: emptyToNull(parsed.data.birthday),
    // Only a badge they hold: the select offers no other, and this is the boundary.
    displayedBadge: heldBadges.has(parsed.data.displayedBadge)
      ? parsed.data.displayedBadge
      : null,
    githubUrl: emptyToNull(parsed.data.githubUrl),
    ...(uploadedAvatarUrl ? { avatarUrl: uploadedAvatarUrl } : {}),
  })

  return uploadedAvatarUrl
}

/**
 * An admin editing someone else's profile: the same fields and the same validation, so a
 * member cannot end up with something they are unable to correct themselves.
 */
export async function updateMemberProfileAsAdmin(formData: FormData) {
  const viewer = await getViewer()

  if (!canManageMembers(viewer)) {
    throw new Error("Not an admin")
  }

  const memberId = String(formData.get("memberId") ?? "")
  if (!/^[0-9a-f-]{36}$/.test(memberId)) return

  const target = await findMemberById(memberId)
  if (!target) return

  const uploadedAvatarUrl = await saveProfile(memberId, formData)

  if (uploadedAvatarUrl) {
    await deleteImageIfOurs("avatars", target.avatarUrl)
  }

  revalidatePath("/admin")
  revalidatePath("/members/[memberId]", "page")
}

export async function updateMyProfile(formData: FormData) {
  const viewer = await getViewer()

  // Re-read membership server-side. Never trust that the page was only shown to members.
  if (!viewer?.member || !isActiveMember(viewer)) {
    throw new Error("Not a member")
  }

  const previousAvatarUrl = viewer.member.avatarUrl
  const uploadedAvatarUrl = await saveProfile(viewer.member.id, formData)

  if (uploadedAvatarUrl) {
    await deleteImageIfOurs("avatars", previousAvatarUrl)
  }

  redirect({ href: "/profile", locale: await getLocale() })
}
