// Label, control and optional hint. Every form field in the app uses this, so spacing and
// hint styling can't drift between the profile form and the event form.

import { ChevronDownIcon } from "@/lib/icons"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export function FormField({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-muted-foreground text-xs">{hint}</p>}
    </div>
  )
}

/**
 * A native select, styled to match Input rather than looking like an OS widget.
 *
 * Native so forms still post without client JavaScript. appearance-none removes the
 * platform arrow, so we draw our own.
 */
export function FormSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="form-select"
        className={cn(
          "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-muted disabled:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 h-9 w-full appearance-none rounded-md border py-1 pr-9 pl-3 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none disabled:cursor-not-allowed disabled:border-transparent aria-invalid:ring-3",
          className,
        )}
        {...props}
      />
      <ChevronDownIcon
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2"
      />
    </div>
  )
}
