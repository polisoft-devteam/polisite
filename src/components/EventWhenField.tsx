// When the event happens: either a known date, or a list of dates for members to vote on.
//
// The two are mutually exclusive, which is why they're one component — each side disables
// the other as soon as it's used. Disabled inputs are left out of FormData, so the server
// receives one answer or the other and never both.

"use client"

import { useState } from "react"

import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CloseIcon, PlusIcon } from "@/lib/icons"
import { cn } from "@/lib/utils"

type EventWhenFieldProps = {
  startsAtLabel: string
  endsAtLabel: string
  endsAtHint: string
  orLabel: string
  pollLegend: string
  pollHint: string
  addDateLabel: string
  removeDateLabel: string
  defaultStartsAt: string
  defaultEndsAt: string
  defaultDateOptions: string[]
}

export function EventWhenField({
  startsAtLabel,
  endsAtLabel,
  endsAtHint,
  orLabel,
  pollLegend,
  pollHint,
  addDateLabel,
  removeDateLabel,
  defaultStartsAt,
  defaultEndsAt,
  defaultDateOptions,
}: EventWhenFieldProps) {
  const [startsAt, setStartsAt] = useState(defaultStartsAt)
  const [endsAt, setEndsAt] = useState(defaultEndsAt)

  // Rows carry an id so removing one doesn't renumber the others' keys.
  const [pollRows, setPollRows] = useState(() =>
    defaultDateOptions.map((value, index) => ({ id: index, value })),
  )
  const [nextRowId, setNextRowId] = useState(defaultDateOptions.length)

  const hasFixedDate = startsAt.length > 0
  const hasPollDates = pollRows.some((row) => row.value.length > 0)

  function addPollRow() {
    setPollRows((rows) => [...rows, { id: nextRowId, value: "" }])
    setNextRowId((id) => id + 1)
  }

  function setPollRowValue(id: number, value: string) {
    setPollRows((rows) =>
      rows.map((row) => (row.id === id ? { ...row, value } : row)),
    )
  }

  return (
    <div className="space-y-6">
      {/* Dimmed as well as disabled, so it's obvious why it won't take input. */}
      <div
        className={cn(
          "grid gap-4 transition-opacity sm:grid-cols-2",
          hasPollDates && "opacity-50",
        )}
      >
        <FormField label={startsAtLabel} htmlFor="startsAtWallTime">
          <Input
            id="startsAtWallTime"
            name="startsAtWallTime"
            type="datetime-local"
            value={startsAt}
            disabled={hasPollDates}
            onChange={(event) => setStartsAt(event.target.value)}
          />
        </FormField>

        <FormField
          label={endsAtLabel}
          htmlFor="endsAtWallTime"
          hint={endsAtHint}
        >
          <Input
            id="endsAtWallTime"
            name="endsAtWallTime"
            type="datetime-local"
            value={endsAt}
            disabled={hasPollDates}
            onChange={(event) => setEndsAt(event.target.value)}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-3">
        <hr className="flex-1" />
        <span className="text-muted-foreground text-xs tracking-wide uppercase">
          {orLabel}
        </span>
        <hr className="flex-1" />
      </div>

      <fieldset
        disabled={hasFixedDate}
        className={cn(
          "space-y-2 transition-opacity",
          hasFixedDate && "opacity-50",
        )}
      >
        <legend className="text-sm font-medium">{pollLegend}</legend>
        <p className="text-muted-foreground text-xs">{pollHint}</p>

        <div className="space-y-2 pt-1">
          {pollRows.map((row) => (
            <div key={row.id} className="flex gap-2">
              <Input
                type="datetime-local"
                name="dateOptions"
                value={row.value}
                onChange={(event) =>
                  setPollRowValue(row.id, event.target.value)
                }
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={removeDateLabel}
                onClick={() =>
                  setPollRows((rows) => rows.filter((r) => r.id !== row.id))
                }
              >
                <CloseIcon className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" variant="outline" size="sm" onClick={addPollRow}>
          <PlusIcon className="size-4" />
          {addDateLabel}
        </Button>
      </fieldset>
    </div>
  )
}
