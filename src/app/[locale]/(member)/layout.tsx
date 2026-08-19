// Everything under (member) requires an active membership.
//
// The check happens here on the server, not in proxy.ts and not by hiding links.
// Queries still re-check on their own — this layout is convenience, not the last line
// of defence.

import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { getViewer, isActiveMember } from "@/lib/auth"

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const viewer = await getViewer()

  if (!isActiveMember(viewer)) {
    redirect({ href: "/", locale: await getLocale() })
  }

  return <>{children}</>
}
