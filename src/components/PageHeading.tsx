// The h1 every page starts with, optionally with buttons on the right.
// One place, so pages can't drift into five slightly different heading sizes.

import { cn } from "@/lib/utils"

export function PageHeading({
  title,
  eyebrow,
  actions,
  isDisplay = false,
}: {
  /** A node rather than a string, so part of a title can be coloured. */
  title: React.ReactNode
  /** Small label above the title — a category, a status. */
  eyebrow?: string
  actions?: React.ReactNode
  /** Bigger and centred, for a page that is one thing to look at, such as the duel. */
  isDisplay?: boolean
}) {
  return (
    <div
      className={cn(
        "flex items-start gap-4",
        isDisplay ? "justify-center text-center" : "justify-between",
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p
            className={cn(
              "text-muted-foreground tracking-wide uppercase",
              isDisplay ? "text-sm" : "text-xs",
            )}
          >
            {eyebrow}
          </p>
        )}
        <h1
          className={cn(
            "font-heading font-extrabold tracking-tight text-balance",
            isDisplay ? "mt-1 text-4xl sm:text-6xl" : "text-3xl",
          )}
        >
          {title}
        </h1>
      </div>

      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
