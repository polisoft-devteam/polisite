// Switches the site between Swedish and English, staying on the current page.
//
// One click rather than a dropdown, like the theme toggle: with two languages a menu is a
// second click to say the only thing the button could have meant. The flags are stacked in
// the button, and the one for the language you are leaving sinks as the next rises.
//
// Every locale gets a flag rendered, so the animation still works if a third is added to
// routing.ts. It would need a flag of its own here.

"use client"

import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

import { Button } from "@/components/ui/button"
import { usePathname, useRouter } from "@/i18n/navigation"
import { localeNames, routing, type Locale } from "@/i18n/routing"
import { cn } from "@/lib/utils"

// Flag colours are the one place literals belong: a Swedish flag is blue and yellow in
// both themes, and no palette change should ever touch them.
function SwedishFlag() {
  return (
    <svg viewBox="0 0 15 10" aria-hidden="true" className="size-full">
      <rect width="15" height="10" fill="#006aa7" />
      <rect x="4.5" width="2" height="10" fill="#fecc00" />
      <rect y="4" width="15" height="2" fill="#fecc00" />
    </svg>
  )
}

function BritishFlag() {
  return (
    <svg viewBox="0 0 15 10" aria-hidden="true" className="size-full">
      <rect width="15" height="10" fill="#012169" />
      <path d="M0,0 L15,10 M15,0 L0,10" stroke="#fff" strokeWidth="2.4" />
      <path d="M0,0 L15,10 M15,0 L0,10" stroke="#c8102e" strokeWidth="1.1" />
      <path d="M7.5,0 V10 M0,5 H15" stroke="#fff" strokeWidth="3.4" />
      <path d="M7.5,0 V10 M0,5 H15" stroke="#c8102e" strokeWidth="1.8" />
    </svg>
  )
}

const LOCALE_FLAG: Record<Locale, React.ReactNode> = {
  sv: <SwedishFlag />,
  en: <BritishFlag />,
}

export function LanguageToggle() {
  const translateLanguage = useTranslations("Language")
  const currentLocale = useLocale() as Locale
  const currentPathname = usePathname()
  const router = useRouter()
  const [isSwitchingLanguage, startLanguageSwitch] = useTransition()

  const nextLocale =
    routing.locales[
      (routing.locales.indexOf(currentLocale) + 1) % routing.locales.length
    ]

  function switchLanguage() {
    // replace() rather than push() so switching language doesn't fill up the back button.
    startLanguageSwitch(() => {
      router.replace(currentPathname, { locale: nextLocale })
    })
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={translateLanguage("switchTo", {
        language: localeNames[nextLocale],
      })}
      onClick={switchLanguage}
      disabled={isSwitchingLanguage}
      className="relative overflow-hidden"
    >
      {routing.locales.map((locale) => (
        <span
          key={locale}
          aria-hidden="true"
          className={cn(
            // 4.5 by 3 keeps the box at the flags' own 3:2, so nothing is stretched.
            "ring-foreground/15 absolute h-3 w-4.5 overflow-hidden rounded-[2px] ring-1 transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] motion-reduce:transition-none",
            locale === currentLocale
              ? "translate-y-0 rotate-0 opacity-100"
              : "translate-y-6 rotate-90 opacity-0",
          )}
        >
          {LOCALE_FLAG[locale]}
        </span>
      ))}
    </Button>
  )
}
