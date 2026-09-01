// The links in the site header, with a bar sliding under whichever page you are on.
// Hidden below `md`, where MobileNav shows the same links instead.
//
// The bar is one element whose position and width are measured from the active link, so
// it animates from one to the next rather than disappearing and reappearing. Measuring is
// the only way to know where a link sits: widths come from the translated label, and a
// Swedish word is not the width of its English counterpart.

"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"

import { Link, usePathname } from "@/i18n/navigation"
import {
  isCurrentNavigationLink,
  mainNavigationLinks,
} from "@/lib/navigation-links"
import { cn } from "@/lib/utils"

type IndicatorPosition = { left: number; width: number }

export function MainNav({
  showAdminLink,
  showMembersLink,
}: {
  showAdminLink: boolean
  showMembersLink: boolean
}) {
  const translateNav = useTranslations("Nav")
  const translateAdmin = useTranslations("Admin")
  const currentPathname = usePathname()

  const navigationRef = useRef<HTMLElement>(null)
  const [indicator, setIndicator] = useState<IndicatorPosition | null>(null)

  // Measured after layout, so the bar is already in place on the first paint rather than
  // sliding in from the left when the page loads.
  useLayoutEffect(() => {
    const nav = navigationRef.current
    if (!nav) return

    function moveToActiveLink() {
      if (!nav) return
      const active = nav.querySelector<HTMLElement>('[aria-current="page"]')
      if (!active) return setIndicator(null)

      const navBox = nav.getBoundingClientRect()
      const linkBox = active.getBoundingClientRect()
      setIndicator({ left: linkBox.left - navBox.left, width: linkBox.width })
    }

    moveToActiveLink()

    // Labels reflow when the language changes or the window resizes, and the bar has to
    // follow rather than sit under where a link used to be.
    const observer = new ResizeObserver(moveToActiveLink)
    observer.observe(nav)

    return () => observer.disconnect()
  }, [currentPathname, translateNav, translateAdmin])

  const linkClassName = "rounded-md px-2 py-2 text-sm transition-colors sm:px-3"
  const activeClassName = "text-foreground font-medium"
  const inactiveClassName = "text-muted-foreground hover:text-foreground"
  const isAdminPage = currentPathname.startsWith("/admin")
  const isMembersPage = currentPathname.startsWith("/members")

  return (
    <nav
      ref={navigationRef}
      className="relative hidden items-center gap-0.5 md:flex lg:gap-1"
    >
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
              isCurrentPage ? activeClassName : inactiveClassName,
            )}
          >
            {translateNav(navigationLink.translationKey)}
          </Link>
        )
      })}

      {showMembersLink && (
        <Link
          href="/members"
          transitionTypes={["nav-forward"]}
          aria-current={isMembersPage ? "page" : undefined}
          className={cn(
            linkClassName,
            isMembersPage ? activeClassName : inactiveClassName,
          )}
        >
          {translateNav("members")}
        </Link>
      )}

      {showAdminLink && (
        <Link
          href="/admin"
          transitionTypes={["nav-forward"]}
          aria-current={isAdminPage ? "page" : undefined}
          className={cn(
            linkClassName,
            isAdminPage ? activeClassName : inactiveClassName,
          )}
        >
          {translateAdmin("nav")}
        </Link>
      )}

      {indicator && (
        <span
          aria-hidden="true"
          className="bg-primary-ink absolute bottom-0.5 h-0.5 rounded-full transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
          style={{ left: indicator.left, width: indicator.width }}
        />
      )}
    </nav>
  )
}
