// Bottom bar shown on every page.

import { useTranslations } from "next-intl"

import { Link } from "@/i18n/navigation"
import { ASSOCIATION_FULL_NAME, ASSOCIATION_NAME } from "@/lib/association"
import { HeartIcon } from "@/lib/icons"

export function SiteFooter() {
  const translateFooter = useTranslations("Footer")

  return (
    <footer className="mt-16 border-t">
      <div className="text-muted-foreground mx-auto flex w-full max-w-6xl 2xl:max-w-7xl flex-col gap-2 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <span>{ASSOCIATION_NAME}</span>

        {/* Split around the heart rather than an emoji in the message file, so it takes
            the colour and size of everything around it. */}
        <span className="flex items-center gap-1.5">
          {translateFooter("builtWith")}
          <HeartIcon
            aria-hidden="true"
            className="text-notification size-3.5"
          />
          {translateFooter("builtBy", {
            associationFullName: ASSOCIATION_FULL_NAME,
          })}
        </span>
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
