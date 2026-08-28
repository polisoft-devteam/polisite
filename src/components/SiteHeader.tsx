// Top bar shown on every page: association name, navigation, theme and language switches.
// Below `md` the links move into MobileNav's hamburger.

import { AuthMenu } from "@/components/AuthMenu"
import { LanguageToggle } from "@/components/LanguageToggle"
import { MainNav } from "@/components/MainNav"
import { MobileNav } from "@/components/MobileNav"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Link } from "@/i18n/navigation"
import { ASSOCIATION_NAME } from "@/lib/association"
import { getViewer } from "@/lib/auth"
import { canManageMembers } from "@/lib/permissions"

export async function SiteHeader() {
  const viewer = await getViewer()
  const showAdminLink = canManageMembers(viewer)

  return (
    <header
      // Named so the CSS can hold it still while the page content slides beneath it.
      style={{ viewTransitionName: "site-header" }}
      className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur"
    >
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-1 px-4 sm:gap-2">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="font-heading mr-1 text-xl font-extrabold tracking-tight sm:mr-2 sm:text-2xl"
        >
          {ASSOCIATION_NAME}
        </Link>

        <MainNav showAdminLink={showAdminLink} />

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <AuthMenu />
          <div className="md:hidden">
            <MobileNav showAdminLink={showAdminLink} />
          </div>
        </div>
      </div>
    </header>
  )
}
