// A wrong answer here means Discord links pointing at localhost in production, which is
// only noticeable once someone clicks one.

import { afterEach, describe, expect, it, vi } from "vitest"

import { getSiteUrl } from "@/lib/site-url"

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("site URL", () => {
  it("prefers the configured domain and strips a trailing slash", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://poli.se/")
    vi.stubEnv("VERCEL_URL", "polisite-abc123.vercel.app")

    expect(getSiteUrl()).toBe("https://poli.se")
  })

  it("falls back to the Vercel deployment rather than localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "")
    vi.stubEnv("VERCEL_URL", "polisite-abc123.vercel.app")

    expect(getSiteUrl()).toBe("https://polisite-abc123.vercel.app")
  })

  it("uses localhost only when nothing else is set", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "")
    vi.stubEnv("VERCEL_URL", "")
    vi.stubEnv("PORT", "3210")

    expect(getSiteUrl()).toBe("http://localhost:3210")
  })

  it("ignores whitespace-only configuration", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "   ")
    vi.stubEnv("VERCEL_URL", "polisite-abc123.vercel.app")

    expect(getSiteUrl()).toBe("https://polisite-abc123.vercel.app")
  })
})
