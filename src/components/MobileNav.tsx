// The site navigation on a phone: a hamburger at the end of the header that slides a panel
// in from the right with every link in it. Shown only below `md`, where MainNav has no
// room for them.
//
// A panel rather than a dropdown because the list has grown: a small floating box made
// each link a tiny target and the whole menu easy to dismiss by accident. Built on the
// dialog primitive so Base UI handles the focus trap, Escape and scroll locking, which a
// hand-rolled panel would have to get right by hand.
//
// The three bars are drawn here rather than taken from the icon set, because an icon can't
// animate into another one: the outer two rotate onto each other to form the cross while
// the middle one collapses. It follows the panel's own open state, so dismissing it any
// way puts the bars back.

"use client"

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { useTranslations } from "next-intl"
import { useState } from "react"

import { signOut } from "@/app/auth/actions"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Link, usePathname } from "@/i18n/navigation"
import { CloseIcon, SignOutIcon } from "@/lib/icons"
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

const drawerLink =
  "rounded-lg px-3 py-3 text-base transition-colors hover:bg-muted"

export function MobileNav({
  showAdminLink,
  showSignOut,
}: {
  showAdminLink: boolean
  showSignOut: boolean
}) {
  const translateAuth = useTranslations("Auth")
  const translateNav = useTranslations("Nav")
  const translateAdmin = useTranslations("Admin")
  const currentPathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  // Client-side navigation doesn't dismiss the panel on its own.
  function closeMenu() {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={translateNav("menu")}
          />
        }
      >
        <MenuBars isOpen={isOpen} />
      </DialogTrigger>

      <DialogPortal>
        <DialogOverlay />

        <DialogPrimitive.Popup
          data-slot="nav-drawer"
          className="bg-popover text-popover-foreground ring-foreground/10 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] flex-col gap-1 p-4 ring-1 duration-300 outline-none"
        >
          <div className="mb-2 flex items-center justify-between">
            <DialogTitle className="text-muted-foreground text-xs tracking-wide uppercase">
              {translateNav("menu")}
            </DialogTitle>

            <DialogPrimitive.Close
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={translateNav("close")}
                />
              }
            >
              <CloseIcon className="size-4" />
            </DialogPrimitive.Close>
          </div>

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
                onClick={closeMenu}
                className={cn(
                  drawerLink,
                  isCurrentPage
                    ? "text-foreground bg-muted font-medium"
                    : "text-muted-foreground",
                )}
              >
                {translateNav(navigationLink.translationKey)}
              </Link>
            )
          })}

          {showAdminLink && (
            <>
              <hr className="border-border my-2" />

              <Link
                href="/admin"
                transitionTypes={["nav-forward"]}
                onClick={closeMenu}
                className={cn(drawerLink, "text-muted-foreground")}
              >
                {translateAdmin("nav")}
              </Link>
            </>
          )}

          {/* Pushed to the foot of the panel: it is the one thing here you do not want to
              hit while reaching for a link. */}
          {showSignOut && (
            <form action={signOut} className="mt-auto pt-4">
              <Button
                type="submit"
                variant="outline"
                className="w-full cursor-pointer"
              >
                <SignOutIcon className="size-4" />
                {translateAuth("signOut")}
              </Button>
            </form>
          )}
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  )
}
