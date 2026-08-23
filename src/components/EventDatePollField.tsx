// Candidate dates for an event, so members can vote on which one works.
//
// A repeatable list, so it has to be a client component. Each row submits under the same
// name, which formData.getAll picks up as an array.

"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CloseIcon, PlusIcon } from "@/lib/icons"

export function EventDatePollField({
  legend,
  hint,
  addLabel,
  removeLabel,
  defaultValues,
}: {
  legend: string
  hint: string
  addLabel: string
  removeLabel: string
  /** Existing options when editing, as datetime-local strings. */
  defaultValues: string[]
}) {
  // Each row needs a stable key that survives removing an earlier one, so rows carry an
  // id rather than being keyed by index.
  const [rows, setRows] = useState(() =>
    defaultValues.map((value, index) => ({ id: index, value })),
  )
  const [nextId, setNextId] = useState(defaultValues.length)

  function addRow() {
    setRows((current) => [...current, { id: nextId, value: "" }])
    setNextId((id) => id + 1)
  }

  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <p className="text-muted-foreground text-xs">{hint}</p>

      <div className="space-y-2 pt-1">
        {rows.map((row) => (
          <div key={row.id} className="flex gap-2">
            <Input
              type="datetime-local"
              name="dateOptions"
              defaultValue={row.value}
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={removeLabel}
              onClick={() =>
                setRows((current) =>
                  current.filter((existing) => existing.id !== row.id),
                )
              }
            >
              <CloseIcon className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addRow}>
        <PlusIcon className="size-4" />
        {addLabel}
      </Button>
    </fieldset>
  )
}
