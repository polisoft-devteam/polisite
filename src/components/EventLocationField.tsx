// Where the event happens: a street address, or online.
//
// The two are mutually exclusive, so ticking the box disables the address input. A
// disabled input is left out of FormData, which is how the server ends up with one answer
// rather than two that disagree — the same trick EventWhenField uses for date-or-poll.

"use client"

import { useState } from "react"

import { FormField } from "@/components/FormField"
import { Input } from "@/components/ui/input"

export function EventLocationField({
  label,
  onlineLabel,
  onlineHint,
  placeholder,
  defaultLocation,
  defaultIsOnline,
}: {
  label: string
  onlineLabel: string
  onlineHint: string
  placeholder: string
  defaultLocation: string
  defaultIsOnline: boolean
}) {
  const [isOnline, setIsOnline] = useState(defaultIsOnline)

  return (
    <FormField label={label} htmlFor="location">
      <Input
        id="location"
        name="location"
        defaultValue={defaultLocation}
        placeholder={placeholder}
        // Only required while it's the answer — an online event has no address to give.
        required={!isOnline}
        disabled={isOnline}
        maxLength={200}
      />

      <label className="mt-2 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isOnline"
          checked={isOnline}
          onChange={(changeEvent) => setIsOnline(changeEvent.target.checked)}
          className="accent-primary size-4"
        />
        {onlineLabel}
      </label>

      {isOnline && (
        <p className="text-muted-foreground mt-1 text-sm">{onlineHint}</p>
      )}
    </FormField>
  )
}
