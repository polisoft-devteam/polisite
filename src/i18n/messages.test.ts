// Guards the two translation files against drifting apart. Adding a Swedish string and
// forgetting the English one is the easiest mistake to make here, and it only shows up
// as a crash on a page nobody visited yet.

import { describe, expect, it } from "vitest"

import englishMessages from "../../messages/en.json"
import swedishMessages from "../../messages/sv.json"
import { mainNavigationLinks } from "@/lib/navigation-links"

type MessageTree = { [key: string]: string | string[] | MessageTree }

function collectKeyPaths(messages: MessageTree, prefix = ""): string[] {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === "string") return [path]

    // Lists carry their length, so a bullet missing in one language fails too.
    if (Array.isArray(value)) return [`${path}[${value.length}]`]

    return collectKeyPaths(value, path)
  })
}

describe("translation files", () => {
  it("define exactly the same keys in Swedish and English", () => {
    const swedishKeys = collectKeyPaths(swedishMessages).sort()
    const englishKeys = collectKeyPaths(englishMessages).sort()

    expect(swedishKeys).toEqual(englishKeys)
  })

  it("have a label for every link in the main navigation", () => {
    for (const navigationLink of mainNavigationLinks) {
      expect(swedishMessages.Nav).toHaveProperty(navigationLink.translationKey)
      expect(englishMessages.Nav).toHaveProperty(navigationLink.translationKey)
    }
  })
})
