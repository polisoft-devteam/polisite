// The sun/moon button in the header. One click flips between light and dark.
//
// Whichever icon is hidden waits below the button, so switching reads as one setting and
// the other rising: click the moon and it sinks while the sun comes up.
//
// Driven by the `dark` class rather than React state, so there is nothing to mismatch on
// hydration and the right icon is showing before any JavaScript runs.
//
// No "system" option any more. The first visit still follows the operating system, since
// that is what next-themes does until a choice is stored, but once someone has picked a
// side the button just flips it.

"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DarkThemeIcon, LightThemeIcon } from "@/lib/icons"

export function ThemeToggle() {
  const translateTheme = useTranslations("Theme")
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={translateTheme("label")}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden"
    >
      <LightThemeIcon className="size-4 transition-all duration-500 dark:translate-y-6 dark:rotate-90 dark:opacity-0" />
      <DarkThemeIcon className="absolute size-4 translate-y-6 rotate-90 opacity-0 transition-all duration-500 dark:translate-y-0 dark:rotate-0 dark:opacity-100" />
    </Button>
  )
}
