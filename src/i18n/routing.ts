// Which languages the site supports, and which one visitors get by default.
// Adding a language means adding it here plus a matching file in /messages.

import { defineRouting } from "next-intl/routing"

export const routing = defineRouting({
  locales: ["sv", "en"],
  defaultLocale: "sv",
})

export type Locale = (typeof routing.locales)[number]

export const localeNames: Record<Locale, string> = {
  sv: "Svenska",
  en: "English",
}
