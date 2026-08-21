// The sun/moon button in the header that switches between light, dark and system theme.

"use client"

import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DarkThemeIcon, LightThemeIcon, SystemThemeIcon } from "@/lib/icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const translateTheme = useTranslations("Theme")
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label={translateTheme("label")}
          />
        }
      >
        {/* Swapped with CSS rather than state, so there's nothing to mismatch on hydration. */}
        <LightThemeIcon className="size-4 dark:hidden" />
        <DarkThemeIcon className="hidden size-4 dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <LightThemeIcon />
          {translateTheme("light")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <DarkThemeIcon />
          {translateTheme("dark")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <SystemThemeIcon />
          {translateTheme("system")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
