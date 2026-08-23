// Loads the right translation file for each incoming request. next-intl calls this
// automatically on the server; you shouldn't need to import it anywhere.

import { readFile } from "node:fs/promises"
import path from "node:path"

import { hasLocale } from "next-intl"
import { getRequestConfig } from "next-intl/server"

import { routing } from "./routing"

/**
 * In development the file is read from disk on every request, so adding a message doesn't
 * need a server restart. The dynamic import used in production is cached by the module
 * system, which silently serves the old messages and reports the new keys as missing.
 */
async function loadMessages(locale: string) {
  if (process.env.NODE_ENV === "development") {
    const file = path.join(process.cwd(), "messages", `${locale}.json`)
    return JSON.parse(await readFile(file, "utf8"))
  }

  return (await import(`../../messages/${locale}.json`)).default
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: await loadMessages(locale),
  }
})
