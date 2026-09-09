// The founder's letter as a modal, without the question of who is being shown it.
//
// Two things raise it: MembershipPrompt, for a signed-in guest who has never answered,
// and the preview page, which exists so the letter can be looked at while signed out.
//
// It waits a moment before appearing. Arriving straight from Google's sign-in, the page
// is still settling, and a letter that lands in the middle of that is a letter nobody
// reads. The pause also gives the crawl and the song the same starting line.

"use client"

import { useEffect, useState } from "react"

import { Modal } from "@/components/Modal"
import { WelcomeCrawl } from "@/components/WelcomeCrawl"
import { SubmitButton } from "@/components/SubmitButton"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { WELCOME_LETTER } from "@/lib/welcome-letter"

/** Long enough for the page behind it to finish arriving, short enough to feel deliberate. */
const OPEN_AFTER_MS = 900

function letterStorageKey(seenKey: string): string {
  return `polisite:welcome-seen:${seenKey}`
}

function hasSeenLetter(seenKey: string): boolean {
  try {
    return localStorage.getItem(letterStorageKey(seenKey)) !== null
  } catch {
    // A browser refusing storage gets the letter every time, which is the kinder failure.
    return false
  }
}

function rememberLetterSeen(seenKey: string) {
  try {
    localStorage.setItem(letterStorageKey(seenKey), new Date().toISOString())
  } catch {}
}

export function WelcomeLetterModal({
  delayMs = OPEN_AFTER_MS,
  showRequest = true,
  seenKey,
  onClosed,
}: {
  /** Zero when somebody asked for it: they have already waited for their own click. */
  delayMs?: number
  /** A member reading it again has nothing to request. */
  showRequest?: boolean
  /**
   * Set when it should open by itself exactly once, keyed by whoever it is opening for.
   *
   * Remembered in this browser rather than in a table: nothing is stored about somebody
   * who has only signed in, which is the promise the privacy page makes. Closing it or
   * ignoring it both count as having seen it, because a letter that returns on every
   * reload stops being a welcome.
   */
  seenKey?: string
  onClosed?: () => void
} = {}) {
  const [isReady, setIsReady] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs === 0) return

    const timer = window.setTimeout(() => {
      if (seenKey && hasSeenLetter(seenKey)) return

      if (seenKey) rememberLetterSeen(seenKey)
      setIsReady(true)
    }, delayMs)

    return () => window.clearTimeout(timer)
  }, [delayMs, seenKey])

  if (!isReady) return null

  return (
    <Modal
      defaultOpen
      title={WELCOME_LETTER.title}
      closeLabel={WELCOME_LETTER.closeLabel}
      // Seven tenths of the window rather than a fixed width: 4xl was most of the screen
      // on a laptop and a postage stamp on a desktop. Capped so it stops growing.
      // Slower and from above: the dialog's own hundred milliseconds is right for a
      // confirmation and too brisk for a letter that has waited to arrive.
      className="data-open:slide-in-from-top-8 max-h-[92svh] overflow-y-auto duration-500 sm:w-[70vw] sm:max-w-5xl"
      backgroundImage="/images/misc/viggeRasse.webp"
      titleClassName="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
      // items-center for the stacked case: below sm the footer is a column, nothing is
      // justified along it, and the form stretched wide leaving the button at its left.
      footerClassName="items-center sm:justify-center"
      onOpenChange={(isOpen) => {
        if (!isOpen) onClosed?.()
      }}
      footer={
        showRequest ? (
          <form action={requestMembership}>
            {/* Plain rather than filled: it sits on a photograph, and the letter is doing
                the persuading. */}
            <SubmitButton variant="outline">
              {WELCOME_LETTER.requestLabel}
            </SubmitButton>
          </form>
        ) : undefined
      }
    >
      <WelcomeCrawl
        paragraphs={WELCOME_LETTER.paragraphs}
        signature={WELCOME_LETTER.signature}
        pauseLabel={WELCOME_LETTER.pauseLabel}
        playLabel={WELCOME_LETTER.playLabel}
        replayLabel={WELCOME_LETTER.replayLabel}
      />
    </Modal>
  )
}
