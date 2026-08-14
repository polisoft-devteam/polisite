// Bottom bar shown on every page.

import { useTranslations } from "next-intl"

export function SiteFooter() {
  const translateSite = useTranslations("Site")
  const translateFooter = useTranslations("Footer")

  return (
    <footer className="mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>{translateSite("name")}</span>
        <span>{translateFooter("note")}</span>
      </div>
    </footer>
  )
}
