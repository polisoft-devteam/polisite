// The links in the site header, with the current page highlighted.
// Hidden below `md`, where MobileNav shows the same links instead.

"use client"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import {
  isCurrentNavigationLink,
  mainNavigationLinks,
} from "@/lib/navigation-links"
import { cn } from "@/lib/utils"

export function MainNav({ showAdminLink }: { showAdminLink: boolean }) {
  const translateNav = useTranslations("Nav")
  const translateAdmin = useTranslations("Admin")
  const currentPathname = usePathname()

  const linkClassName = "rounded-md px-2 py-2 text-sm transition-colors sm:px-3"

  return (
    <nav className="hidden items-center gap-0.5 md:flex lg:gap-1">
      {mainNavigationLinks.map((navigationLink) => {
        const isCurrentPage = isCurrentNavigationLink(
          navigationLink.href,
          currentPathname,
        )

        return (
          <Link
            key={navigationLink.href}
            href={navigationLink.href}
            transitionTypes={["nav-forward"]}
            aria-current={isCurrentPage ? "page" : undefined}
            className={cn(
              linkClassName,
              isCurrentPage
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {translateNav(navigationLink.translationKey)}
          </Link>
        )
      })}

      {showAdminLink && (
        <Link
          href="/admin"
          transitionTypes={["nav-forward"]}
          className={cn(
            linkClassName,
            currentPathname.startsWith("/admin")
              ? "text-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {translateAdmin("nav")}
        </Link>
      )}
    </nav>
  )
}
