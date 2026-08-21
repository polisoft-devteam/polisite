// Bottom bar shown on every page.

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { ASSOCIATION_NAME } from "@/lib/association"

export function SiteFooter() {
  const translateFooter = useTranslations("Footer")

  return (
    <footer className="mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>{ASSOCIATION_NAME}</span>
        <span>{translateFooter("note")}</span>
        <Link
          href="/privacy"
          transitionTypes={["nav-forward"]}
          className="hover:text-foreground transition-colors"
        >
          {translateFooter("privacy")}
        </Link>
      </div>
    </footer>
  )
}
