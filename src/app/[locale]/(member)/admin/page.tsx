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
import { PageSection } from "@/components/PageSection"
import { Button } from "@/components/ui/button"
import { MemberAvatar } from "@/components/MemberAvatar"
import { Badge } from "@/components/ui/badge"
import {
  approveMembership,
  deactivateMember,
  denyMembership,
  reactivateMember,
} from "@/features/members/admin-actions"
import {
  findAllMembersWithRoles,
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

  const [viewer, requests, allMembers] = await Promise.all([
    getViewer(),
    findPendingMembershipRequests(),
    findAllMembersWithRoles(),
  ])

  return (
    <PageContainer>
      <PageHeading title={translateAdmin("title")} />

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
              <li
                key={member.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
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
                        <form action={deactivateMember}>
                          <input
                            type="hidden"
                            name="memberId"
                            value={member.id}
                          />
                          <Button type="submit" variant="outline" size="sm">
                            {translateAdmin("deactivate")}
                          </Button>
                        </form>
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
              </li>
            )
          })}
        </ItemList>
      </PageSection>
    </PageContainer>
  )
}
