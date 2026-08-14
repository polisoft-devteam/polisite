// Top bar shown on every page: association name, navigation, theme and language switches.

import { useTranslations } from "next-intl"

import { LanguageToggle } from "@/components/LanguageToggle"
import { MainNav } from "@/components/MainNav"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Link } from "@/i18n/navigation"

export function SiteHeader() {
  const translateSite = useTranslations("Site")

  return (
    <header className="bg-background/80 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4">
        <Link href="/" className="mr-2 font-semibold tracking-tight">
          {translateSite("name")}
        </Link>

        <MainNav />

        <div className="ml-auto flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
