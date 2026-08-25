// The site navigation on a phone: a hamburger at the end of the header that drops the
// links down beneath it. Shown only below `md`, where MainNav has no room for them.

"use client"

import { useTranslations } from "next-intl"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link, usePathname } from "@/i18n/navigation"
import { MenuIcon } from "@/lib/icons"
import {
  isCurrentNavigationLink,
  mainNavigationLinks,
} from "@/lib/navigation-links"
import { cn } from "@/lib/utils"

export function MobileNav({ showAdminLink }: { showAdminLink: boolean }) {
  const translateNav = useTranslations("Nav")
  const translateAdmin = useTranslations("Admin")
  const currentPathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Client-side navigation doesn't dismiss the menu on its own.
  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={translateNav("menu")}
          />
        }
      >
        <MenuIcon className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {mainNavigationLinks.map((navigationLink) => {
          const isCurrentPage = isCurrentNavigationLink(
            navigationLink.href,
            currentPathname,
          )

          return (
            <DropdownMenuItem
              key={navigationLink.href}
              onClick={closeMenu}
              render={
                <Link
                  href={navigationLink.href}
                  transitionTypes={["nav-forward"]}
                  aria-current={isCurrentPage ? "page" : undefined}
                />
              }
              className={cn(isCurrentPage && "text-foreground font-medium")}
            >
              {translateNav(navigationLink.translationKey)}
            </DropdownMenuItem>
          )
        })}

        {showAdminLink && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={closeMenu}
              render={<Link href="/admin" transitionTypes={["nav-forward"]} />}
            >
              {translateAdmin("nav")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
