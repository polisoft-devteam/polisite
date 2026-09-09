// Reads the founder's letter again, for somebody who is already in.
//
// The letter shows itself once, to a guest, and then never again, which leaves the members
// it is about unable to see the thing that welcomed them. This is that button. It opens
// the same modal, minus the request: a member has nothing left to ask for.

"use client"

import { useState } from "react"

import { WelcomeLetterModal } from "@/components/WelcomeLetterModal"
import { Button } from "@/components/ui/button"
import { EnvelopeIcon } from "@/lib/icons"

export function WelcomeLetterButton({ label }: { label: string }) {
  // Counted rather than a boolean: reopening needs a new modal, because the old one closed
  // itself and would stay closed.
  const [openCount, setOpenCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setOpenCount((count) => count + 1)
          setIsOpen(true)
        }}
      >
        <EnvelopeIcon className="size-4" />
        {label}
      </Button>

      {isOpen && (
        <WelcomeLetterModal
          key={openCount}
          delayMs={0}
          showRequest={false}
          onClosed={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
