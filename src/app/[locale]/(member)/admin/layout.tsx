// Everything under /admin requires the admin role, checked here on the server.
// The pages re-check in their own actions — this layout is convenience, not the last line
// of defence.

import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { canManageMembers } from "@/lib/permissions"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const viewer = await getViewer()

  if (!canManageMembers(viewer)) {
    redirect({ href: "/", locale: await getLocale() })
  }

  return <>{children}</>
}
