// The one thing a signed-in guest can do on the front page, with proof that it happened.
//
// A client component only so the press has something to say while the server is thinking:
// the request writes a row and pings Discord, which is a second or two of a page that
// otherwise looks untouched. useFormStatus reads the state of the form it sits in, which
// is why it has to be a child of it rather than the form itself.

"use client"

import { useFormStatus } from "react-dom"

import { Spinner } from "@/components/Spinner"
import { Button } from "@/components/ui/button"
import { HoverSwapIcon } from "@/components/HoverSwapIcon"
import { EnvelopeIcon, NewEventIcon } from "@/lib/icons"

export function RequestMembershipButton({
  label,
  sendingLabel,
  className,
}: {
  label: string
  sendingLabel: string
  className?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" className={className} disabled={pending}>
      {pending ? (
        <Spinner />
      ) : (
        <HoverSwapIcon Idle={EnvelopeIcon} Hover={NewEventIcon} />
      )}
      {pending ? sendingLabel : label}
    </Button>
  )
}
