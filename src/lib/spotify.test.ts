import { describe, expect, it } from "vitest"

import { spotifyEmbed } from "@/lib/spotify"

describe("spotifyEmbed", () => {
  it("turns a share link into the player's own URL", () => {
    expect(
      spotifyEmbed("https://open.spotify.com/playlist/0LxXS2Sx7F9oeesyRI15N5")
        ?.url,
    ).toBe(
      "https://open.spotify.com/embed/playlist/0LxXS2Sx7F9oeesyRI15N5?utm_source=generator",
    )
  })

  it("skips the locale the share sheet adds", () => {
    expect(
      spotifyEmbed(
        "https://open.spotify.com/intl-sv/track/4cOdK2wGLETKBW3PvgPWqT",
      )?.url,
    ).toBe(
      "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT?utm_source=generator",
    )
  })

  it("gives a track less room than a playlist", () => {
    expect(
      spotifyEmbed("https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT")
        ?.isCompact,
    ).toBe(true)
    expect(
      spotifyEmbed("https://open.spotify.com/album/4cOdK2wGLETKBW3PvgPWqT")
        ?.isCompact,
    ).toBe(false)
  })

  it("refuses anything the player cannot show", () => {
    expect(spotifyEmbed("https://open.spotify.com")).toBeNull()
    expect(spotifyEmbed("https://open.spotify.com/user/victor")).toBeNull()
    expect(spotifyEmbed("https://example.com/playlist/123")).toBeNull()
    expect(spotifyEmbed("not a url")).toBeNull()
    expect(spotifyEmbed(null)).toBeNull()
  })
})
