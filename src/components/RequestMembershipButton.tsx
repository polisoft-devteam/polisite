// The one thing a signed-in guest can do on the front page, with proof that it happened.
//
// A thin wrapper over SubmitButton so the hero can name what "sending" looks like: the
// request writes a row and pings Discord, which is a second or two of a page that would
// otherwise look untouched.

"use client"

import { SubmitButton } from "@/components/SubmitButton"
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
  return (
    <SubmitButton
      className={className}
      pendingLabel={sendingLabel}
      icon={<HoverSwapIcon Idle={EnvelopeIcon} Hover={NewEventIcon} />}
    >
      {label}
    </SubmitButton>
  )
}
