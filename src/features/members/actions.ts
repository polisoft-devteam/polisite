"use server"

import { revalidatePath } from "next/cache"
import { getLocale } from "next-intl/server"
import { z } from "zod"

import { updateMemberProfile } from "@/features/members/queries"
import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { isActiveMember } from "@/lib/permissions"
import { deleteImageIfOurs, uploadImage } from "@/lib/storage"

// Validated on the server because this is the boundary. Anything the browser sends is
// untrusted — client-side validation is a convenience, never a control. See CLAUDE.md.
const profileSchema = z.object({
  fullName: z.string().trim().min(1).max(120),
  nickname: z.string().trim().max(60),
  officialTitle: z.string().trim().max(60),
  funTitle: z.string().trim().max(60),
  bio: z.string().trim().max(2000),
})

/** Empty inputs come through as "" — store null so the database has one kind of blank. */
function emptyToNull(value: string): string | null {
  return value.length === 0 ? null : value
}

export async function updateMyProfile(formData: FormData) {
  const viewer = await getViewer()

  // Re-read membership server-side. Never trust that the page was only shown to members.
  if (!viewer?.member || !isActiveMember(viewer)) {
    throw new Error("Not a member")
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName") ?? "",
    nickname: formData.get("nickname") ?? "",
    officialTitle: formData.get("officialTitle") ?? "",
    funTitle: formData.get("funTitle") ?? "",
    bio: formData.get("bio") ?? "",
  })

  if (!parsed.success) return

  const uploadedAvatarUrl = await uploadImage(
    "avatars",
    formData.get("avatar") as File | null,
  )

  await updateMemberProfile(viewer.member.id, {
    fullName: parsed.data.fullName,
    nickname: emptyToNull(parsed.data.nickname),
    officialTitle: emptyToNull(parsed.data.officialTitle),
    funTitle: emptyToNull(parsed.data.funTitle),
    bio: emptyToNull(parsed.data.bio),
    ...(uploadedAvatarUrl ? { avatarUrl: uploadedAvatarUrl } : {}),
  })

  if (uploadedAvatarUrl) {
    await deleteImageIfOurs("avatars", viewer.member.avatarUrl)
  }

  revalidatePath("/", "layout")

  redirect({ href: "/profile", locale: await getLocale() })
}
