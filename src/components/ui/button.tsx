import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border-2 bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "[--button-accent:var(--color-primary)] [--button-accent-foreground:var(--color-primary-foreground)] [--button-fill:var(--button-sweep,var(--color-primary))] border-primary text-primary-ink bg-transparent",
        outline:
          "[--button-accent:var(--color-foreground)] [--button-accent-foreground:var(--color-background)] border-border bg-transparent text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input",
        secondary:
          "bg-secondary text-secondary-foreground aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "[--button-accent:var(--color-destructive)] [--button-accent-foreground:var(--color-background)] border-destructive bg-transparent text-destructive focus-visible:ring-destructive/20",
        success:
          "[--button-accent:var(--color-success)] [--button-accent-foreground:var(--color-background)] border-success bg-transparent text-success",
        info: "[--button-accent:var(--color-info)] [--button-accent-foreground:var(--color-background)] border-info bg-transparent text-info",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

// Ghost and link are text, not surfaces, and an icon-only button is too small for a
// diagonal to read as anything but a flicker. Everything else sweeps; see globals.css.
const PLAIN_VARIANTS = new Set(["ghost", "link"])

function isIconSize(size: string) {
  return size === "icon" || size.startsWith("icon-")
}

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  const sweeps = !PLAIN_VARIANTS.has(variant ?? "") && !isIconSize(size ?? "")

  // Only the brand button wears the brand. A destructive one filling with a pink and blue
  // gradient would stop reading as danger, which is the one thing it has to do.
  const isBrand = (variant ?? "default") === "default"

  return (
    <ButtonPrimitive
      data-slot="button"
      data-sweep={sweeps ? "true" : undefined}
      data-brand={sweeps && isBrand ? "true" : undefined}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
