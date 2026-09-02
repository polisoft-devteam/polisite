// The going button, with paper.
//
// A client component only so the click can set the confetti off; the form underneath still
// posts to the server action exactly as the other two answers do, so this works the same
// with or without the celebration.

"use client"

import { useState } from "react"

import { Confetti } from "@/components/Confetti"
import { Button } from "@/components/ui/button"

export function CelebrateGoing({
  icon,
  label,
  className,
  isSelected,
}: {
  icon?: React.ReactNode
  label: string
  className?: string
  isSelected: boolean
}) {
  const [seed, setSeed] = useState<number | null>(null)

  return (
    <>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        className={className}
        // Optimistic on purpose: the form is posting either way, and waiting for the
        // round trip would put the confetti after the page had already changed.
        onClick={() => {
          if (!isSelected) setSeed(Date.now())
        }}
      >
        {icon}
        {label}
      </Button>

      {seed !== null && <Confetti seed={seed} onDone={() => setSeed(null)} />}
    </>
  )
}
