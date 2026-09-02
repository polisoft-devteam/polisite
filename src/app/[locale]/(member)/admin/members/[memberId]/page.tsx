// An admin editing someone else's profile.
//
// The same fields a member gets in settings, from the same component, so an admin can
// always fix what a member got wrong and the two can never offer different things.
//
// Admins only, checked here as well as in the action: a page that renders is not a
// permission, and the action is what an attacker would call.

import type { Metadata } from "next"

import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { BackLink } from "@/components/BackLink"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { ProfileFields } from "@/components/ProfileFields"
import { Button } from "@/components/ui/button"
import { updateMemberProfileAsAdmin } from "@/features/members/actions"
import { findMemberById } from "@/features/members/queries"
import { findBadgesForMember } from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { canManageMembers } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin/members/[memberId]">): Promise<Metadata> {
  const { memberId } = await params
  const member = await findMemberById(memberId)

  return { title: member?.fullName }
}

export default async function AdminMemberPage({
  params,
}: PageProps<"/[locale]/admin/members/[memberId]">) {
  const { locale, memberId } = await params
  setRequestLocale(locale)

  const translateAdmin = await getTranslations("Admin")
  const translateProfile = await getTranslations("Profile")
  const viewer = await getViewer()

  if (!canManageMembers(viewer)) notFound()

  const member = await findMemberById(memberId)
  if (!member) notFound()

  const badges = await findBadgesForMember(member.id)

  return (
    <PageContainer>
      <BackLink href="/admin">{translateAdmin("nav")}</BackLink>

      <div className="mt-4">
        <PageHeading eyebrow={member.email} title={member.fullName} />
      </div>

      <form
        action={updateMemberProfileAsAdmin}
        className="mt-8 max-w-lg space-y-6"
      >
        <input type="hidden" name="memberId" value={member.id} />

        {/* Keyed on the row's own timestamp: saving revalidates this page, and an
            uncontrolled input whose defaultValue changes under it warns rather than
            updating. Remounting sets the new defaults once, which is also what you want
            to see after a save. */}
        <ProfileFields
          key={member.updatedAt.toISOString()}
          member={member}
          badges={badges}
        />

        <Button type="submit" size="lg">
          {translateProfile("save")}
        </Button>
      </form>
    </PageContainer>
  )
}
