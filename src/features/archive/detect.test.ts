// Sorting a pasted link into the right shelf. This is what the add form leans on, so a
// wrong answer here files somebody's holiday album under videos.

import { describe, expect, it } from "vitest"

import { detectArchiveLink } from "@/features/archive/detect"

const kindOf = (url: string) => detectArchiveLink(url)?.kind ?? null
const idOf = (url: string) => detectArchiveLink(url)?.externalId ?? null

describe("photo albums", () => {
  it("takes the share URL Google's button produces, key and all", () => {
    const url =
      "https://photos.google.com/share/AF1QipOusjOCIf?key=ZFd1Vy1JazIxaTNj"
    expect(kindOf(url)).toBe("album")
  })

  it("takes the short form the app hands out", () => {
    expect(kindOf("https://photos.app.goo.gl/abc123")).toBe("album")
  })
})

describe("films", () => {
  it("reads the id off a watch link", () => {
    expect(idOf("https://www.youtube.com/watch?v=4YU7wdGniXE")).toBe(
      "4YU7wdGniXE",
    )
    expect(kindOf("https://www.youtube.com/watch?v=4YU7wdGniXE")).toBe("film")
  })

  it("reads it off the short, embed, shorts and live forms too", () => {
    expect(idOf("https://youtu.be/UHUWKOX_M7s")).toBe("UHUWKOX_M7s")
    expect(idOf("https://www.youtube.com/embed/VvEEHjrxWzA")).toBe(
      "VvEEHjrxWzA",
    )
    expect(idOf("https://youtube.com/shorts/abc123")).toBe("abc123")
    expect(idOf("https://youtube.com/live/xyz789")).toBe("xyz789")
  })

  it("keeps the id when the link carries a timestamp and a playlist", () => {
    expect(
      idOf("https://www.youtube.com/watch?v=4YU7wdGniXE&t=42s&list=PL123"),
    ).toBe("4YU7wdGniXE")
  })

  it("does not mistake the YouTube front page for a film", () => {
    expect(kindOf("https://www.youtube.com/")).toBe("resource")
  })
})

describe("playlists", () => {
  it("reads the id off a Spotify playlist", () => {
    expect(
      idOf("https://open.spotify.com/playlist/0LxXS2Sx7F9oeesyRI15N5"),
    ).toBe("0LxXS2Sx7F9oeesyRI15N5")
    expect(
      kindOf("https://open.spotify.com/playlist/0LxXS2Sx7F9oeesyRI15N5"),
    ).toBe("playlist")
  })

  it("copes with the localised path Spotify sometimes gives", () => {
    expect(
      idOf("https://open.spotify.com/intl-sv/playlist/1B95qmpqc7g1wgdcFcBUwP"),
    ).toBe("1B95qmpqc7g1wgdcFcBUwP")
  })

  it("does not take an album or a track for a playlist", () => {
    expect(kindOf("https://open.spotify.com/album/123")).toBe("resource")
    expect(kindOf("https://open.spotify.com/track/123")).toBe("resource")
  })
})

describe("SoundCloud", () => {
  it("takes a track link as it comes off the address bar", () => {
    const url = "https://soundcloud.com/jon239yup/vaelkommentilloutland"
    expect(kindOf(url)).toBe("soundcloud")
    expect(idOf(url)).toBe(url)
  })

  it("takes a user and a set as well, which the widget can also show", () => {
    expect(kindOf("https://soundcloud.com/kamelpaj")).toBe("soundcloud")
    expect(kindOf("https://soundcloud.com/kamelpaj/sets/nagot")).toBe(
      "soundcloud",
    )
  })

  it("digs the real link out of a player URL somebody pasted", () => {
    const player =
      "https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/kamelpaj/farbror-blabar&color=%23506454"

    expect(kindOf(player)).toBe("soundcloud")
    expect(idOf(player)).toBe("https://soundcloud.com/kamelpaj/farbror-blabar")
  })

  it("does not take the front page for a track", () => {
    expect(kindOf("https://soundcloud.com/")).toBe("resource")
  })
})

describe("everything else", () => {
  it("keeps an unrecognised link rather than refusing it", () => {
    expect(kindOf("https://sv.wikipedia.org/wiki/Poli")).toBe("resource")
    expect(kindOf("https://drive.google.com/drive/folders/abc")).toBe(
      "resource",
    )
  })

  it("refuses what is not a web address at all", () => {
    expect(detectArchiveLink("not a url")).toBe(null)
    expect(detectArchiveLink("")).toBe(null)
    // A scheme that does not fetch a page has no business being rendered as a link.
    expect(detectArchiveLink("javascript:alert(1)")).toBe(null)
    expect(detectArchiveLink("file:///etc/passwd")).toBe(null)
  })

  it("ignores surrounding whitespace, which a paste often brings", () => {
    expect(kindOf("  https://youtu.be/abc  ")).toBe("film")
  })
})
