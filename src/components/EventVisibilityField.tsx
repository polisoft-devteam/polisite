// Attendees and visibility, with the explanation for the chosen option shown underneath.
// Client-side because the description has to change as you pick.

"use client"

import { useState } from "react"

import { FormSelect } from "@/components/FormField"
import { Label } from "@/components/ui/label"
import type { EventVisibility } from "@/db/schema"

type EventVisibilityFieldProps = {
  label: string
  /** Option label and explanation per visibility, translated by the caller. */
  options: {
    value: EventVisibility
    label: string
    explanation: string
  }[]
  defaultValue: EventVisibility
}

export function EventVisibilityField({
  label,
  options,
  defaultValue,
}: EventVisibilityFieldProps) {
  const [selected, setSelected] = useState<EventVisibility>(defaultValue)

  const explanation = options.find(
    (option) => option.value === selected,
  )?.explanation

  return (
    <div className="space-y-2">
      <Label htmlFor="visibility">{label}</Label>
      <FormSelect
        id="visibility"
        name="visibility"
        value={selected}
        onChange={(event) => setSelected(event.target.value as EventVisibility)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>

      {explanation && (
        <p className="text-muted-foreground bg-muted/50 rounded-md px-3 py-2 text-xs">
          {explanation}
        </p>
      )}
    </div>
  )
}
