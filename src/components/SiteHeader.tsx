// Top bar shown on every page: association name, navigation, theme and language switches.
// Below `md` the links move into MobileNav's hamburger.

import { AuthMenu } from "@/components/AuthMenu"
import { LanguageToggle } from "@/components/LanguageToggle"
import { MainNav } from "@/components/MainNav"
import { MobileNav } from "@/components/MobileNav"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Wordmark } from "@/components/Wordmark"
import { Link } from "@/i18n/navigation"
import { getViewer } from "@/lib/auth"
import { canManageMembers } from "@/lib/permissions"

export async function SiteHeader() {
  const viewer = await getViewer()
  const showAdminLink = canManageMembers(viewer)
  const showSignOut = viewer !== null

  return (
    <header
      // Named so the CSS can hold it still while the page content slides beneath it.
      style={{ viewTransitionName: "site-header" }}
      className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-1 px-4 sm:gap-2 xl:h-16 2xl:max-w-7xl">
        <Link href="/" transitionTypes={["nav-back"]} className="mr-1 sm:mr-2">
          <Wordmark />
        </Link>

        <MainNav showAdminLink={showAdminLink} />

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <AuthMenu />
          <div className="md:hidden">
            <MobileNav
              showAdminLink={showAdminLink}
              showSignOut={showSignOut}
            />
          </div>
        </div>
      </div>
    </header>
  )
}
