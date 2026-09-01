// The site navigation on a phone: a hamburger at the end of the header that drops the
// links down beneath it. Shown only below `md`, where MainNav has no room for them.
//
// The three bars are drawn here rather than taken from the icon set, because an icon can't
// animate into another one: the outer two rotate onto each other to form the cross while
// the middle one collapses. It follows the menu's own open state, so dismissing it by
// clicking away or following a link puts the bars back.

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
import {
  isCurrentNavigationLink,
  mainNavigationLinks,
} from "@/lib/navigation-links"
import { cn } from "@/lib/utils"

// Every bar sits dead centre; the closed state is the outer two pushed apart from there,
// so becoming a cross is one transform back to the middle.
const menuBar =
  "absolute top-1/2 left-1/2 h-0.5 w-4 -translate-x-1/2 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none"

function MenuBars({ isOpen }: { isOpen: boolean }) {
  return (
    <span aria-hidden="true" className="relative block size-5">
      <span
        className={cn(
          menuBar,
          isOpen
            ? "translate-y-[-50%] rotate-45"
            : "translate-y-[calc(-50%-5px)]",
        )}
      />
      <span
        className={cn(
          menuBar,
          "translate-y-[-50%]",
          isOpen && "scale-x-0 opacity-0",
        )}
      />
      <span
        className={cn(
          menuBar,
          isOpen
            ? "translate-y-[-50%] -rotate-45"
            : "translate-y-[calc(-50%+5px)]",
        )}
      />
    </span>
  )
}

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
        <MenuBars isOpen={isOpen} />
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
