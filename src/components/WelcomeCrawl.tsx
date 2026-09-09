// The founder's letter, crawling, with a song under it.
//
// Pausing sets animation-play-state rather than stopping and restarting, so the text holds
// exactly where it was. Replaying remounts the animated element through its key, which is
// the reliable way to restart a CSS animation from the beginning — resetting the property
// needs a forced reflow in between or the browser coalesces the change and nothing happens.
// The song follows both: pausing the crawl pauses it, replaying takes it back to the top.
//
// It starts quietly and it may not start at all. A browser refuses to play sound on a page
// nobody has touched yet, so the first press of anything in here is what gets it going,
// and the ear icon says there is something to hear either way.

"use client"

import { useEffect, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  PauseIcon,
  PlayIcon,
  ReplayIcon,
  WarningIcon,
  WearHeadphonesIcon,
} from "@/lib/icons"

export function WelcomeCrawl({
  paragraphs,
  signature,
  pauseLabel,
  playLabel,
  replayLabel,
}: {
  paragraphs: readonly string[]
  signature: string
  pauseLabel: string
  playLabel: string
  replayLabel: string
}) {
  const [isPaused, setIsPaused] = useState(false)
  const [runNumber, setRunNumber] = useState(0)
  const song = useRef<HTMLAudioElement | null>(null)

  // Under the reading, never over it.
  //
  // A browser refuses to play sound on a page nobody has touched yet, and the letter opens
  // by itself, so the first attempt is usually turned down. The next touch anywhere on the
  // page tries again, which is the gesture the browser was waiting for.
  useEffect(() => {
    const audio = new Audio("/sounds/welcome.mp3")
    audio.volume = 0.18
    song.current = audio

    // The refusal comes back after the effect may already have been torn down and set up
    // again, which development does on purpose. Without this flag the discarded run still
    // arms its listener, and the first touch starts two songs at once.
    let isCurrent = true

    function startOnFirstTouch() {
      if (isCurrent) void audio.play().catch(() => {})
    }

    void audio.play().catch(() => {
      if (!isCurrent) return

      document.addEventListener("pointerdown", startOnFirstTouch, {
        once: true,
      })
      document.addEventListener("keydown", startOnFirstTouch, { once: true })
    })

    return () => {
      isCurrent = false
      document.removeEventListener("pointerdown", startOnFirstTouch)
      document.removeEventListener("keydown", startOnFirstTouch)
      audio.pause()
      audio.src = ""
      song.current = null
    }
  }, [])

  function togglePause() {
    setIsPaused((paused) => {
      if (paused) void song.current?.play().catch(() => {})
      else song.current?.pause()

      return !paused
    })
  }

  function replay() {
    setRunNumber((run) => run + 1)
    setIsPaused(false)

    const audio = song.current
    if (!audio) return

    try {
      audio.currentTime = 0
    } catch {}

    void audio.play().catch(() => {})
  }

  return (
    <div className="relative">
      {/* A note, not a control: there is a song under this, and the mark says so rather
          than leaving the ears to be read as decoration. Bottom left, out of the crawl's
          way and away from the buttons on the other side. */}
      <span
        aria-hidden="true"
        className="text-muted-foreground absolute bottom-0 left-0 z-10 flex items-center gap-0.5"
      >
        <WearHeadphonesIcon className="size-5" />
        <WarningIcon className="size-3.5" />
      </span>

      {/* A dark screen for the crawl to recede into, with Vigge showing through. */}
      <div className="crawl-stage rounded-lg bg-black/70 px-6">
        <div className="crawl-tilt">
          <div
            key={runNumber}
            className="crawl-text space-y-8 text-lg leading-[2.4] sm:text-xl"
            style={{ animationPlayState: isPaused ? "paused" : "running" }}
          >
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}

            <p className="pt-2 whitespace-pre-line italic">{signature}</p>
          </div>
        </div>
      </div>

      {/* Hidden when the crawl is not running, where they would control nothing. */}
      <div className="mt-2 flex justify-center gap-1 motion-reduce:hidden">
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={isPaused ? playLabel : pauseLabel}
          onClick={togglePause}
        >
          {isPaused ? (
            <PlayIcon className="size-4" />
          ) : (
            <PauseIcon className="size-4" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={replayLabel}
          onClick={replay}
        >
          <ReplayIcon className="size-4" />
        </Button>
      </div>
    </div>
  )
}
