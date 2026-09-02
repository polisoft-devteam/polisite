// The h1 every page starts with, optionally with buttons on the right.
// One place, so pages can't drift into five slightly different heading sizes.

export function PageHeading({
  title,
  eyebrow,
  actions,
}: {
  /** A node rather than a string, so part of a title can be coloured. */
  title: React.ReactNode
  /** Small label above the title — a category, a status. */
  eyebrow?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading text-3xl font-extrabold tracking-tight text-balance">
          {title}
        </h1>
      </div>

      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  )
}
