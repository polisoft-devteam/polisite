// Sets the confetti off once, when the page it sits on has just been reached by doing
// something worth celebrating.
//
// A component rather than a hook, because the two callers are server components: an event
// page rendered after answering, and the event page you land on after creating one.

"use client"

import { useState } from "react"

import { Confetti } from "@/components/Confetti"

export function CelebrateOnMount({ seed }: { seed: number }) {
  const [hasCelebrated, setHasCelebrated] = useState(false)

  if (hasCelebrated) return null

  return <Confetti seed={seed} onDone={() => setHasCelebrated(true)} />
}
