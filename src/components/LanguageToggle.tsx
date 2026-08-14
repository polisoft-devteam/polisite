// Switches the site between Swedish and English, staying on the current page.

"use client"

import { CheckIcon, LanguagesIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { usePathname, useRouter } from "@/i18n/navigation"
import { localeNames, routing, type Locale } from "@/i18n/routing"

export function LanguageToggle() {
  const translateLanguage = useTranslations("Language")
  const currentLocale = useLocale()
  const currentPathname = usePathname()
  const router = useRouter()
  const [isSwitchingLanguage, startLanguageSwitch] = useTransition()

  function switchToLocale(nextLocale: Locale) {
    // replace() rather than push() so switching language doesn't fill up the back button.
    startLanguageSwitch(() => {
      router.replace(currentPathname, { locale: nextLocale })
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="sm"
            aria-label={translateLanguage("label")}
            disabled={isSwitchingLanguage}
          />
        }
      >
        <LanguagesIcon className="size-4" />
        <span className="text-xs font-medium">
          {currentLocale.toUpperCase()}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((selectableLocale) => (
          <DropdownMenuItem
            key={selectableLocale}
            onClick={() => switchToLocale(selectableLocale)}
          >
            {/* Kept in the layout even when hidden, so labels don't shift as you switch. */}
            <CheckIcon
              aria-hidden="true"
              className={
                selectableLocale === currentLocale
                  ? "size-4"
                  : "size-4 opacity-0"
              }
            />
            {localeNames[selectableLocale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
