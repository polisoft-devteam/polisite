// A select that explains the option you picked, underneath it.
//
// Client-side because the explanation has to change as you choose. Used for event kind and
// visibility, where the option labels alone don't convey the consequence.

"use client"

import { useState } from "react"

import { FormSelect } from "@/components/FormField"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type ExplainedOption = {
  value: string
  label: string
  explanation: string
}

export function ExplainedSelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string
  label: string
  options: ExplainedOption[]
  defaultValue: string
}) {
  const [selected, setSelected] = useState(defaultValue)

  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>

      <FormSelect
        id={name}
        name={name}
        value={selected}
        onChange={(event) => setSelected(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </FormSelect>

      {/* Every explanation sits in the same grid cell, so the box is always as tall as
          the longest of them and choosing a different option cannot move anything below
          it. A minimum height only helps until an explanation is longer than the
          minimum, which is how this still jumped. */}
      <div className="text-muted-foreground bg-muted/50 grid rounded-md px-3 py-2 text-xs">
        {options.map((option) => (
          <p
            key={option.value}
            aria-hidden={option.value !== selected}
            className={cn(
              "col-start-1 row-start-1 transition-opacity duration-200 motion-reduce:transition-none",
              option.value === selected ? "opacity-100" : "opacity-0",
            )}
          >
            {option.explanation}
          </p>
        ))}
      </div>
    </div>
  )
}
