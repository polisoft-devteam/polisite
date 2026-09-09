// Everything under (signed-in) needs a Google account, and nothing more.
//
// The middle ground between (public) and (member): your own profile, the settings that
// edit it, and the other members' pages. Somebody waiting on an admin to let them in can
// read those and keep their own up to date, which is a better welcome than a redirect.
//
// The check happens here on the server, not in proxy.ts and not by hiding links. What
// each page then shows still depends on membership: see permissions.ts.

import { getLocale } from "next-intl/server"

import { redirect } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"

export default async function SignedInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const viewer = await getViewer()

  if (!viewer) {
    redirect({ href: "/", locale: await getLocale() })
  }

  return <>{children}</>
}
