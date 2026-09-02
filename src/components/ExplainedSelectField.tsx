// A select that explains the option you picked, underneath it.
//
// Client-side because the explanation has to change as you choose. Used for event kind and
// visibility, where the option labels alone don't convey the consequence.

"use client"

import { useState } from "react"

import { FormSelect } from "@/components/FormField"
import { Label } from "@/components/ui/label"

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

  const explanation = options.find(
    (option) => option.value === selected,
  )?.explanation

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

      {/* A fixed floor, because the explanations are different lengths and the fields
          below were shifting a few pixels every time the choice changed. */}
      <p className="text-muted-foreground bg-muted/50 flex min-h-10 items-center rounded-md px-3 py-2 text-xs">
        {explanation}
      </p>
    </div>
  )
}
