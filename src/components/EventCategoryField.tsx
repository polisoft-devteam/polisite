// The category picker, with an icon per type.
//
// A native <option> can hold only text, so this is a menu with a hidden input carrying the
// value — the form still posts a plain "category" field.
//
// The icons are imported here rather than passed in: only plain data can cross from a
// Server Component to a Client Component, and a React component isn't plain data.

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
import type { EventCategory } from "@/db/schema"
import { EVENT_CATEGORY_ICON } from "@/features/events/labels"
import { ChevronDownIcon } from "@/lib/icons"

export type EventCategoryOption = {
  value: EventCategory
  label: string
}

export function EventCategoryField({
  label,
  options,
  defaultValue,
}: {
  label: string
  options: EventCategoryOption[]
  defaultValue: EventCategory
}) {
  const [selectedValue, setSelectedValue] =
    useState<EventCategory>(defaultValue)

  const selected =
    options.find((option) => option.value === selectedValue) ?? options[0]
  const SelectedIcon = EVENT_CATEGORY_ICON[selected.value]

  return (
    <div className="space-y-2">
      <Label htmlFor="category-trigger">{label}</Label>

      <input type="hidden" name="category" value={selectedValue} />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              id="category-trigger"
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
            const OptionIcon = EVENT_CATEGORY_ICON[option.value]

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
