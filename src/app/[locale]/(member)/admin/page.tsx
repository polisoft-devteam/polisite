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
import {
  approveMembership,
  denyMembership,
} from "@/features/members/admin-actions"
import { findPendingMembershipRequests } from "@/features/members/queries"

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

  const requests = await findPendingMembershipRequests()

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
    </PageContainer>
  )
}
