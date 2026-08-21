// Label, control and optional hint. Every form field in the app uses this, so spacing and
// hint styling can't drift between the profile form and the event form.

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
 * A native select styled to match Input.
 *
 * Native rather than the shadcn Select so forms post without client JavaScript — see
 * EventForm. Kept here so the styling lives in one place.
 */
export function FormSelect({
  className,
  ...props
}: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "border-input bg-background focus-visible:border-ring focus-visible:ring-ring/50 h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs focus-visible:ring-[3px] focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  )
}
