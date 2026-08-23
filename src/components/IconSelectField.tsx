// A select that shows an icon next to each option.
//
// A native <select> can't render anything but text in its options, so this is a menu with
// a hidden input carrying the value — the form still posts a plain field.

"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { ChevronDownIcon, type IconComponent } from "@/lib/icons"

export type IconSelectOption = {
  value: string
  label: string
  Icon: IconComponent
}

export function IconSelectField({
  name,
  label,
  options,
  defaultValue,
}: {
  name: string
  label: string
  options: IconSelectOption[]
  defaultValue: string
}) {
  const [selectedValue, setSelectedValue] = useState(defaultValue)

  const selected =
    options.find((option) => option.value === selectedValue) ?? options[0]
  const SelectedIcon = selected.Icon

  return (
    <div className="space-y-2">
      <Label htmlFor={`${name}-trigger`}>{label}</Label>

      <input type="hidden" name={name} value={selectedValue} />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              id={`${name}-trigger`}
              type="button"
              variant="outline"
              className="h-9 w-full justify-between font-normal"
            />
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <SelectedIcon className="text-muted-foreground size-4 shrink-0" />
            <span className="truncate">{selected.label}</span>
          </span>
          <ChevronDownIcon
            aria-hidden="true"
            className="text-muted-foreground size-3.5 shrink-0"
          />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-56">
          {options.map((option) => {
            const OptionIcon = option.Icon

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setSelectedValue(option.value)}
              >
                <OptionIcon className="size-4" />
                {option.label}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
