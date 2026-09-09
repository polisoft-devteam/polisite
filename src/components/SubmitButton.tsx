// A submit button that says it is working.
//
// Every form on this site posts to a server action, and most of them touch the database,
// Supabase or Discord on the way. That is a second or two where a button that looks
// untouched invites a second press and reads as broken. This one turns into a spinner and
// refuses further presses until the answer is back.
//
// useFormStatus reads the state of the form it sits inside, which is why this has to be a
// child of the form rather than the form itself, and why it is a client component while
// the form and the action stay on the server.

"use client"

import { useFormStatus } from "react-dom"

import { Spinner } from "@/components/Spinner"
import { Button } from "@/components/ui/button"

export function SubmitButton({
  children,
  pendingLabel,
  icon,
  ...buttonProps
}: React.ComponentProps<typeof Button> & {
  /** Shown instead of the label while the action is away. Omit to keep the label. */
  pendingLabel?: string
  /** Swapped for the spinner while pending. */
  icon?: React.ReactNode
}) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" {...buttonProps} disabled={pending}>
      {pending ? <Spinner /> : icon}
      {pending && pendingLabel ? pendingLabel : children}
    </Button>
  )
}
