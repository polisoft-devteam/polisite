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
import { Button } from "@/components/ui/button"
import { requestMembership } from "@/features/members/membership-prompt-actions"
import { WELCOME_LETTER } from "@/lib/welcome-letter"

/** Long enough for the page behind it to finish arriving, short enough to feel deliberate. */
const OPEN_AFTER_MS = 900

export function WelcomeLetterModal({
  delayMs = OPEN_AFTER_MS,
  showRequest = true,
  onClosed,
}: {
  /** Zero when somebody asked for it: they have already waited for their own click. */
  delayMs?: number
  /** A member reading it again has nothing to request. */
  showRequest?: boolean
  onClosed?: () => void
} = {}) {
  const [isReady, setIsReady] = useState(delayMs === 0)

  useEffect(() => {
    if (delayMs === 0) return

    const timer = window.setTimeout(() => setIsReady(true), delayMs)

    return () => window.clearTimeout(timer)
  }, [delayMs])

  if (!isReady) return null

  return (
    <Modal
      defaultOpen
      title={WELCOME_LETTER.title}
      closeLabel={WELCOME_LETTER.closeLabel}
      className="max-h-[92svh] overflow-y-auto sm:max-w-4xl"
      backgroundImage="/images/misc/viggeRasse.webp"
      titleClassName="text-center text-2xl font-semibold tracking-tight sm:text-3xl"
      footerClassName="sm:justify-center"
      onOpenChange={(isOpen) => {
        if (!isOpen) onClosed?.()
      }}
      footer={
        showRequest ? (
          <form action={requestMembership}>
            {/* Plain rather than filled: it sits on a photograph, and the letter is doing
                the persuading. */}
            <Button type="submit" variant="outline">
              {WELCOME_LETTER.requestLabel}
            </Button>
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
