// Reminder checkboxes, capped so only two can be ticked. Zod enforces the same limit on
// the server; this just stops the form letting you pick a third in the first place.

"use client"

import { useState } from "react"

import type { ReminderOffset } from "@/db/schema"
import { MAX_REMINDERS_PER_EVENT } from "@/lib/time"

type EventReminderFieldProps = {
  legend: string
  hint: string
  atLimitHint: string
  options: { value: ReminderOffset; label: string }[]
  defaultSelected: ReminderOffset[]
}

export function EventReminderField({
  legend,
  hint,
  atLimitHint,
  options,
  defaultSelected,
}: EventReminderFieldProps) {
  const [selected, setSelected] = useState<ReminderOffset[]>(defaultSelected)

  const atLimit = selected.length >= MAX_REMINDERS_PER_EVENT

  function toggle(offset: ReminderOffset) {
    setSelected((current) =>
      current.includes(offset)
        ? current.filter((value) => value !== offset)
        : [...current, offset],
    )
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <p className="text-muted-foreground text-xs">
        {atLimit ? atLimitHint : hint}
      </p>

      <div className="space-y-2 pt-1">
        {options.map((option) => {
          const isSelected = selected.includes(option.value)

          return (
            <label
              key={option.value}
              className={
                isSelected || !atLimit
                  ? "flex items-center gap-2 text-sm"
                  : "text-muted-foreground flex items-center gap-2 text-sm"
              }
            >
              <input
                type="checkbox"
                name="reminderOffsets"
                value={option.value}
                checked={isSelected}
                // Unticking is always allowed; only adding a third is blocked.
                disabled={!isSelected && atLimit}
                onChange={() => toggle(option.value)}
                className="border-input size-4 rounded border"
              />
              {option.label}
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
