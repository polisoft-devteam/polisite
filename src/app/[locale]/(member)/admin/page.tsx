import type { Metadata } from "next"
import {
  getFormatter,
  getTranslations,
  setRequestLocale,
} from "next-intl/server"

import { EmptyState } from "@/components/EmptyState"
import { ItemList } from "@/components/ItemList"
import { PageContainer } from "@/components/PageContainer"
import { PageHeading } from "@/components/PageHeading"
import { Link } from "@/i18n/navigation"
import { DesignIcon } from "@/lib/icons"
import { PageSection } from "@/components/PageSection"
import { Modal, ModalClose } from "@/components/Modal"
import { Button } from "@/components/ui/button"
import { MemberAvatar } from "@/components/MemberAvatar"
import { MemberBadgeAdmin } from "@/components/MemberBadgeAdmin"
import { Badge } from "@/components/ui/badge"
import {
  approveMembership,
  deactivateMember,
  denyMembership,
  reactivateMember,
} from "@/features/members/admin-actions"
import {
  findAllMembersWithRoles,
  findBadgesByMember,
  findPendingMembershipRequests,
} from "@/features/members/queries"
import { getViewer } from "@/lib/auth"
import { canDeactivateMember } from "@/lib/permissions"

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/admin">): Promise<Metadata> {
  const { locale } = await params
  const translateAdmin = await getTranslations({ locale, namespace: "Admin" })

  return { title: translateAdmin("title") }
}

export default async function AdminPage({
  params,
}: PageProps<"/[locale]/admin">) {
  const { locale } = await params
  setRequestLocale(locale)

  const translateAdmin = await getTranslations("Admin")
  const format = await getFormatter({ locale })

  const [viewer, requests, allMembers, badgesByMember] = await Promise.all([
    getViewer(),
    findPendingMembershipRequests(),
    findAllMembersWithRoles(),
    findBadgesByMember(),
  ])

  return (
    <PageContainer>
      <PageHeading
        title={translateAdmin("title")}
        // Every component in every state, and the palette lab. Reachable from the only
        // page an admin already opens, rather than remembered as a URL.
        actions={
          <Button
            nativeButton={false}
            variant="outline"
            size="sm"
            render={<Link href="/design" transitionTypes={["nav-forward"]} />}
          >
            <DesignIcon className="size-4" />
            {translateAdmin("designPage")}
          </Button>
        }
      />

      <PageSection heading={translateAdmin("requestsTitle")}>
        {requests.length === 0 ? (
          <EmptyState>{translateAdmin("requestsEmpty")}</EmptyState>
        ) : (
          <ItemList>
            {requests.map((request) => (
              <li
                key={request.authUserId}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">
                    {request.fullName ?? request.email}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {request.email}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {format.dateTime(request.requestedAt, {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Europe/Stockholm",
                    })}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <form action={denyMembership}>
                    <input
                      type="hidden"
                      name="authUserId"
                      value={request.authUserId}
                    />
                    <Button type="submit" variant="outline" size="sm">
                      {translateAdmin("deny")}
                    </Button>
                  </form>

                  <form action={approveMembership}>
                    <input
                      type="hidden"
                      name="authUserId"
                      value={request.authUserId}
                    />
                    <Button type="submit" size="sm">
                      {translateAdmin("approve")}
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ItemList>
        )}
      </PageSection>

      <PageSection heading={translateAdmin("membersTitle")}>
        <ItemList>
          {allMembers.map((member) => {
            const canDeactivate = canDeactivateMember(viewer, member)
            const isViewer = member.id === viewer?.member?.id

            return (
              <li key={member.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <MemberAvatar
                      fullName={member.fullName}
                      avatarUrl={member.avatarUrl}
                      className="size-8 text-xs"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{member.fullName}</p>
                      <p className="text-muted-foreground truncate text-sm">
                        {member.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {member.roles.includes("admin") && (
                      <Badge variant="secondary">
                        {translateAdmin("roleAdmin")}
                      </Badge>
                    )}

                    {member.status === "active" ? (
                      <>
                        {!canDeactivate ? (
                          <span className="text-muted-foreground text-xs">
                            {isViewer
                              ? translateAdmin("thatsYou")
                              : translateAdmin("adminProtected")}
                          </span>
                        ) : (
                          /* Asked first, and in the colour of what it does: shutting
                             someone out of the association is not a button to brush
                             against. The dialog says what survives it. */
                          <Modal
                            title={translateAdmin("deactivateConfirmTitle")}
                            description={translateAdmin(
                              "deactivateConfirmBody",
                            )}
                            closeLabel={translateAdmin("close")}
                            trigger={
                              <Button variant="destructive" size="sm">
                                {translateAdmin("deactivate")}
                              </Button>
                            }
                            footer={
                              <>
                                <ModalClose
                                  render={
                                    <Button variant="outline" size="sm" />
                                  }
                                >
                                  {translateAdmin("cancel")}
                                </ModalClose>

                                <form action={deactivateMember}>
                                  <input
                                    type="hidden"
                                    name="memberId"
                                    value={member.id}
                                  />
                                  <Button
                                    type="submit"
                                    variant="destructive"
                                    size="sm"
                                  >
                                    {translateAdmin("deactivate")}
                                  </Button>
                                </form>
                              </>
                            }
                          >
                            <p className="text-sm font-medium">
                              {member.fullName}
                            </p>
                          </Modal>
                        )}
                      </>
                    ) : (
                      <>
                        <Badge variant="outline">
                          {translateAdmin("statusInactive")}
                        </Badge>
                        <form action={reactivateMember}>
                          <input
                            type="hidden"
                            name="memberId"
                            value={member.id}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {translateAdmin("reactivate")}
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>

                {/* Only for a member who is actually in: a patch on someone who has not
                    been let in yet says nothing. */}
                {member.status === "active" && (
                  <MemberBadgeAdmin
                    memberId={member.id}
                    officialTitle={member.officialTitle}
                    badges={badgesByMember.get(member.id) ?? []}
                  />
                )}
              </li>
            )
          })}
        </ItemList>
      </PageSection>
    </PageContainer>
  )
}
