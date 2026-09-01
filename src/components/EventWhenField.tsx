// When the event happens: either a known date, or a list of dates for members to vote on.
//
// The two are mutually exclusive, which is why they're one component. The fixed date opens
// filled in with today, so the poll can't be the side that gives way — adding a poll date
// is the deliberate act, and it greys the fixed date out. Disabled inputs are left out of
// FormData, so the server receives one answer or the other and never both.

"use client"

import { useState } from "react"

import { FormField } from "@/components/FormField"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CloseIcon, PlusIcon } from "@/lib/icons"

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
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={startsAtLabel} htmlFor="startsAtWallTime">
          <Input
            id="startsAtWallTime"
            name="startsAtWallTime"
            type="datetime-local"
            value={startsAt}
            // Either a date or a poll is required, so this is only optional once the
            // poll has something in it. Cross-field rules can't be expressed in HTML.
            required={!hasPollDates}
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

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{pollLegend}</legend>
        <p className="text-muted-foreground text-xs">{pollHint}</p>

        {/* A date and a delete button need nothing like the full form width. */}
        <div className="max-w-xs space-y-2 pt-1">
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
