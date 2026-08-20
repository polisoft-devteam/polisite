// The links in the site header, with the current page highlighted.

"use client"

import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import { mainNavigationLinks } from "@/lib/navigation-links"
import { cn } from "@/lib/utils"

export function MainNav() {
  const translateNav = useTranslations("Nav")
  const currentPathname = usePathname()

  return (
    <nav className="flex items-center gap-0.5 sm:gap-1">
      {mainNavigationLinks.map((navigationLink) => {
        const isCurrentPage =
          navigationLink.href === "/"
            ? currentPathname === "/"
            : currentPathname.startsWith(navigationLink.href)

        return (
          <Link
            key={navigationLink.href}
            href={navigationLink.href}
            transitionTypes={["nav-forward"]}
            aria-current={isCurrentPage ? "page" : undefined}
            className={cn(
              "rounded-md px-2 py-2 text-sm transition-colors sm:px-3",
              isCurrentPage
                ? "text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {translateNav(navigationLink.translationKey)}
          </Link>
        )
      })}
    </nav>
  )
}
