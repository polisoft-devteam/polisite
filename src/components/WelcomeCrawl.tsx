// The founder's letter, crawling. Client-side only for the two controls.
//
// Pausing sets animation-play-state rather than stopping and restarting, so the text holds
// exactly where it was. Replaying remounts the animated element through its key, which is
// the reliable way to restart a CSS animation from the beginning — resetting the property
// needs a forced reflow in between or the browser coalesces the change and nothing happens.

"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { PauseIcon, PlayIcon, ReplayIcon } from "@/lib/icons"

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

  function replay() {
    setRunNumber((run) => run + 1)
    setIsPaused(false)
  }

  return (
    <div>
      {/* A dark screen for the crawl to recede into, with Vigge showing through. */}
      <div className="crawl-stage rounded-lg bg-black/70 px-6">
        <div className="crawl-tilt">
          <div
            key={runNumber}
            className="crawl-text space-y-4 text-sm leading-relaxed"
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
          onClick={() => setIsPaused((paused) => !paused)}
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
